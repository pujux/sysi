const info = require('systeminformation'),
	moment = require('moment'),
	publicIp = require('public-ip'),
	table = require('text-table'),
	chalk = require('chalk');

const [,, configPath = './config.json'] = process.argv,
	{ settings, parts } = require(configPath);

settings.seperator = settings.seperator.repeat(settings.seperatorLength)

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
	const lines = (await Promise.all(parts.map(async ({ name, enabled, ...args }) => {
		let data;
		switch (name) {
			case 'seperator':
				if (!enabled) break;
				return ['seperator', ''];

			case 'os':
				if (!enabled) break;
				data = await info.osInfo();
				if (!data || !data.distro) break;
				return [
					chalk.hex(settings.primaryColor)('OS'),
					`${data.distro}${args.version && data.release ? `, ${data.release}` : ''}${args.arch && data.arch ? ` (${data.arch})` : ''}`
				];

			case 'cpu':
				if (!enabled) break;
				data = { ...await info.cpu(), temp: (await info.cpuTemperature()).main };
				if (!data || !data.manufacturer || !data.brand) break;
				return [
					chalk.hex(settings.primaryColor)('CPU'),
					`${data.manufacturer} ${data.brand}${args.cores && data.physicalCores > 0 ? ` (${data.physicalCores})` : ''}${args.speed && data.speed > 0 ? ` @ ${data.speed}GHz` : ''}${args.temp && data.temp > 0 ? ` (${data.temp} °C)` : ''}`
				];

			case 'uptime':
				if (!enabled) break;
				data = info.time();
				if (!data || !data.uptime || data.uptime < 0)	break;
				return [
					chalk.hex(settings.primaryColor)('Uptime'),
					`${formatDuration(moment.duration(data.uptime, 'seconds'))}`
				];

			case 'gpu':
				if (!enabled) break;
				data = (await info.graphics()).controllers;
				if (!data || data.length === 0) break;
				return [
					chalk.hex(settings.primaryColor)('GPU'),
					`${data.filter(con => con.model).map(con => `${con.model}${args.vram && con.vram > 0 ? ` (${formatBytes(con.vram * 1024 ** 2, true)})` : ''}`).join(', ')}`
				];

			case 'memory':
				if (!enabled) break;
				data = await info.mem();
				if (!data || !data.active || data.active < 0 || !data.total || data.total < 0) break;
				return [
					chalk.hex(settings.primaryColor)('Memory'),
					`${formatBytes(data.active)} / ${formatBytes(data.total)}${args.percent ? ` (${(data.active / data.total).toFixed(2) * 100} %)` : ''}`
				];

			case 'display':
				if (!enabled) break;
				data = (await info.graphics()).displays;
				if (!data || data.length === 0) break;
				return [
					chalk.hex(settings.primaryColor)('Display'),
					`${data.filter(dis => !args.mainOnly || dis.main).map(dis => `${dis.resolutionx}x${dis.resolutiony}`).join(', ')}`
				];

			case 'proc':
				if (!enabled) break;
				data = await info.processes();
				if (!data || !data.all || data.all < 0) break;
				return [
					chalk.hex(settings.primaryColor)('Processes'),
					data.all
				];

			case 'battery':
				if (!enabled) break;
				data = await info.battery();
				if (!data || !data.percent || data.percent < 0) break;
				return [
					chalk.hex(settings.primaryColor)('Battery'),
					`${data.percent} %${args.timeRemaining ? ` (${data.ischarging ? 'charging' : formatDuration(moment.duration(data.timeremaining, 'minutes'))})` : ''}`
				];

			case 'ping':
				if (!enabled) break;
				data = await info.inetLatency();
				if (!data || data < 0) break;
				return [
					chalk.hex(settings.primaryColor)('Ping'),
					`${data.toFixed(0)} ms`
				];

			case 'publicIp':
				if (!enabled) break;
				data = await publicIp.v4();
				if (!data) break;
				return [
					chalk.hex(settings.primaryColor)('Public IP'),
					data
				];

			case 'net':
				if (!enabled) break;
				data = await info.networkInterfaces();
				if (!data || data.length === 0) break;
				return [
					chalk.hex(settings.primaryColor)('Net'),
					data.filter(net => net.ip4 && net.ifaceName && (args.noLocal && net.ifaceName !== 'lo0' || !args.noLocal)).map(net => `${net.ip4} (${net.ifaceName})`).join(', ')
				];

			case 'shell':
				if (!enabled) break;
				data = await info.shell();
				if (!data) break;
				return [
					chalk.hex(settings.primaryColor)('Shell'),
					data
				];

			case 'users':
				if (!enabled) break;
				data = await info.users();
				if (!data || data.length === 0) break;
				return [
					chalk.hex(settings.primaryColor)('Online'),
					[...new Set(data.map(user => user.user).filter(user => user))].join(', ')
				];
		}
		return undefined;
	})))
	.filter(line => line)
	.map(([a, b]) => [
		a !== 'seperator' ? a + chalk.hex(settings.suffixColor)(settings.suffix) : a, 
		chalk.hex(settings.secondaryColor)(b)
	]);

	const { osInfo: { hostname } } = await info.get({ osInfo: 'hostname' });
	let text = `${chalk.hex(settings.titleColor)(hostname)}\nseperator\n${table(lines)}`;
	text = text.replace(/seperator/g, chalk.hex(settings.seperatorColor)(settings.seperator));
	console.log(text);
})();
