#!/usr/bin/env node
const info = require('systeminformation'),
	moment = require('moment'),
	chalk = require('chalk');

const [,, configPath = './config.json'] = process.argv,
	{ settings, parts } = require(configPath);

settings.seperator = settings.seperator.repeat(settings.seperatorLength);

const formatBytes = (bytes = 0, withGb) => {
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.min(parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10), sizes.length - (!withGb ? 2 : 1));
	return `${(bytes / (1024 ** i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
};

const formatDuration = (duration) => {
	const components = [];
	if (duration.days() > 0) { components.push(`${duration.days()} day${duration.days() > 1 ? 's' : ''}`); }
	if (duration.days() > 0 || duration.hours() > 0) { components.push(`${duration.hours()} hour${duration.hours() > 1 ? 's' : ''}`); }
	if (duration.days() > 0 || duration.hours() > 0 || duration.minutes() > 0) { components.push(`${duration.minutes()} minute${duration.minutes() > 1 ? 's' : ''}`); }
	if (duration.days() === 0 && duration.hours() === 0) { components.push(`${duration.seconds()} second${duration.seconds() > 1 ? 's' : ''}`); }
	return components.join(', ');
};

(async () => {
	if (settings.title) {
		const { osInfo: { hostname } } = await info.get({ osInfo: 'hostname' });
		console.info(`${chalk.hex(settings.titleColor)(hostname)}`);
		console.info(chalk.hex(settings.seperatorColor)(settings.seperator));
	}
	parts.forEach(async ({ name, enabled, ...args}) => {
		let data;
		try {
			switch (name) {
				case 'seperator':
					if (!enabled) break;
					console.info(chalk.hex(settings.seperatorColor)(settings.seperator));
					break;

				case 'os':
					if (!enabled) break;
					data = await info.osInfo();
					if (!data || !data.distro) break;
					console.info(`${chalk.hex(settings.primaryColor)('OS'.padEnd(15))}${data.distro}${args.version && data.release ? `, ${data.release}` : ''}${args.arch && data.arch ? ` (${data.arch})` : ''}`);
					break;

				case 'cpu':
					if (!enabled) break;
					data = { ...await info.cpu(), temp: (await info.cpuTemperature()).main };
					if (!data || !data.manufacturer || !data.brand) break;
					console.info(`${chalk.hex(settings.primaryColor)('CPU'.padEnd(15))}${data.manufacturer} ${data.brand}${args.cores && data.physicalCores > 0 ? ` (${data.physicalCores})` : ''}${args.speed && data.speed > 0 ? ` @ ${data.speed}GHz` : ''}${args.temp && data.temp > 0 ? ` (${data.temp} °C)` : ''}`);
					break;

				case 'uptime':
					if (!enabled) break;
					data = info.time();
					if (!data || !data.uptime || data.uptime < 0)	break;
					console.info(`${chalk.hex(settings.primaryColor)('Uptime'.padEnd(15))}${formatDuration(moment.duration(data.uptime, 'seconds'))}`);
					break;

				case 'gpu':
					if (!enabled) break;
					data = (await info.graphics()).controllers;
					if (!data || data.length === 0) break;
					console.info(`${chalk.hex(settings.primaryColor)('GPU'.padEnd(15))}${data.filter(con => con.model).map(con => `${con.model}${args.vram && con.vram > 0 ? ` (${formatBytes(con.vram * 1524 ** 2, true)})` : ''}`).join(', ')}`);
					break;

				case 'memory':
					if (!enabled) break;
					data = await info.mem();
					if (!data || !data.active || data.active < 0 || !data.total || data.total < 0) break;
					console.info(`${chalk.hex(settings.primaryColor)('Memory'.padEnd(15))}${formatBytes(data.active)} / ${formatBytes(data.total)}${args.percent ? ` (${(data.active / data.total).toFixed(2) * 100} %)` : ''}`);
					break;

				case 'display':
					if (!enabled) break;
					data = (await info.graphics()).displays;
					if (!data || data.length === 0) break;
					data.forEach((m, x) => {
						data = data.filter(dis => !args.mainOnly || dis.main);
						console.info(`${chalk.hex(settings.primaryColor)(`Display ${x + 1}`.padEnd(15))}${m.resolutionX}x${m.resolutionY}`)
					});
					break;

				case 'proc':
					if (!enabled) break;
					data = await info.processes();
					if (!data || !data.all || data.all < 0) break;
					console.info(`${chalk.hex(settings.primaryColor)('Processes'.padEnd(15))}${data.all}`);
					break;

				case 'battery':
					if (!enabled) break;
					data = await info.battery();
					if (!data || !data.percent || data.percent < 0) break;
					console.info(`${chalk.hex(settings.primaryColor)('Battery'.padEnd(15))}${data.percent}%${args.timeRemaining ? ` (${data.ischarging ? 'charging' : formatDuration(moment.duration(data.timeremaining, 'minutes'))})` : ''}`);
					break;

				case 'ping':
					if (!enabled) break;
					data = await info.inetLatency();
					if (!data || data < 0) break;
					console.info(`${chalk.hex(settings.primaryColor)('Ping'.padEnd(15))}${data.toFixed(0)}ms`);
					break;

				case 'publicIp':
					if (!enabled) break;
					publicIp = import('public-ip');
					data = await publicIp.v4();
					if (!data) break;
					console.info(`${chalk.hex(settings.primaryColor)('Public IP'.padEnd(15))}${data}`);
					break;

				case 'net':
					if (!enabled) break;
					data = await info.networkInterfaces();
					if (!data || data.length === 0) break;
					console.info(`${chalk.hex(settings.primaryColor)('Net'.padEnd(15))}${data.filter(net => net.ip4 && net.ifaceName && (args.noLocal && net.ifaceName !== 'lo0' || !args.noLocal)).map(net => `${net.ip4} (${net.ifaceName})`).join(', ')}`);
					break;

				case 'shell':
					if (!enabled) break;
					data = await info.shell();
					if (!data) break;
					console.info(`${chalk.hex(settings.primaryColor)('Shell'.padEnd(15))}${data}`);
					break;

				case 'users':
					if (!enabled) break;
					data = await info.users();
					if (!data || data.length === 0) break;
					console.info(`${chalk.hex(settings.primaryColor)('Online'.padEnd(15))}${[...new Set(data.map(user => user.user).filter(user => user))].join(', ')}`);
					break;

				case 'cpuLoad':
					if (!enabled) break;
					data = await info.currentLoad();
					if (!data || !data.currentload || data.currentload < 0) break;
					console.info(`${chalk.hex(settings.primaryColor)('CPU Load'.padEnd(15))}${data.currentload.toFixed(2)}%`);
					break;

				case 'storage':
					if (!enabled) break;
					data = await info.diskLayout();
					if (!data || data.length < 1) break;
					data.forEach((disk, i) => {
						console.info(`${chalk.hex(settings.primaryColor)(`Disk ${++i}`.padEnd(15))}${disk.interfaceType} ${`${disk.type !== 'Unspecified' ? disk.type === 'HD' ? 'HDD' : disk.type : '???'} ${formatBytes(disk.size, true)}`.padEnd(15)}` + disk.name);
					});
					break;
			}
		} catch { }
	})
})();