const info = require('systeminformation'),
	moment = require('moment')
const publicIp = require('public-ip')
	table = require('text-table'),
	[,, configPath='./config.json'] = process.argv,
	{ settings, parts } = JSON.parse(require('fs').readFileSync(configPath))

const formatBytes = (bytes = 0, withGb) => {
	const sizes = ['B', 'KB', 'MB', 'GB']
	const i = Math.min(parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10), sizes.length - (!withGb ? 2 : 1))
	return `${(bytes / (1024 ** i)).toFixed(i ? 1 : 0)} ${sizes[i]}`
}

const formatDuration = (duration) => {
	let components = []
	if(duration.days() > 0)
		components.push(`${duration.days()} days`)
	if(duration.days() > 0 || duration.hours() > 0)
		components.push(`${duration.hours()} hours`)
	if(duration.days() > 0 || duration.hours() > 0 || duration.minutes() > 0)
		components.push(`${duration.minutes()} minutes`)
	if(duration.days() == 0 && duration.hours() == 0)
		components.push(`${duration.seconds()} seconds`)
	return components.join(', ')
}

(async () => {
	const lines = (await Promise.all(parts.map(async ({ name, enabled, ...args }) => {
		let data
		switch(name) {
			case 'seperator':
				if(!enabled) break
				return ['seperator','']

			case 'os': 
				if(!enabled) break
				data = await info.osInfo()
				if(!data) break
				return ['OS', `${data.distro}${args.version ? `, ${data.release}` : ''}`]
			
			case 'apps': 
				if(!enabled) break
				data = await info.versions(args.list.join(', '))
				if(!data) break
				return ['Apps', `${Object.entries(data).filter(([,v]) => v).map(([k,v]) => `${k}@${v}`).join(', ')}`]
			
			case 'cpu':
				if(!enabled) break
				data = await info.cpu()
				if(!data) break
				return ['CPU', `${data.manufacturer} ${data.brand}${args.cores ? ` (${data.physicalCores})` : ''}${args.speed ? ` @ ${data.speed}GHz` : ''}`]
			
			case 'uptime': 
				if(!enabled) break
				data = await info.time()
				if(!data) break
				return ['Uptime', `${formatDuration(moment.duration(data.uptime, 'seconds'))}`]
			
			case 'gpu':
				if(!enabled) break
				data = (await info.graphics()).controllers
				if(!data) break
				return ['GPU', `${data.map(c => `${c.model}${args.vram ? ` (${formatBytes(c.vram*1024*1024, true)})`: ''}`).join(', ')}`]
			
			case 'memory':
				if(!enabled) break
				data = await info.mem()
				if(!data) break
				return ['Memory', `${formatBytes(data.active)} / ${formatBytes(data.total)}${settings.percent ? ` (${(data.active/data.total).toFixed(2)*100} %)` : ''}`]
			
			case 'display':
				if(!enabled) break
				data = (await info.graphics()).displays
				if(!data) break
				return ['Display', `${data.filter(d => !args.mainOnly || d.main).map(d => `${d.resolutionx}x${d.resolutiony}`).join(', ')}`]
			
			case 'proc':
				if(!enabled) break
				data = await info.processes()
				if(!data) break
				return ['Processes', data.all]
			
			case 'battery':
				if(!enabled) break
				data = await info.battery()
				if(!data) break
				return ['Battery', `${data.percent} %${args.timeRemaining ? ` (${data.acconnected ? 'charging' : moment.duration(data.timeremaining, 'minutes').humanize()})`: ''}`]
			
			case 'ping':
				if(!enabled) break
				data = await info.inetLatency()
				if(!data) break
				return ['Ping', `${data.toFixed(0)} ms`]	
			
			case 'publicIp':
				if(!enabled) break
				data = await publicIp.v4()		
				if(!data) break
				return ['Public IP', data]
			
			case 'net':
				if(!enabled) break
				data = await info.networkInterfaces()
				if(!data) break
				return ['Net', data.filter(n => n.ip4).map(n => `${n.ip4} (${n.ifaceName})`).join(', ')]
		}
	}))).filter(x => x).map(([a, b]) => [a && a !== 'seperator' ? a+settings.suffix : a, b])

	const { hostname } = await info.osInfo()
	let text = `${hostname}\nseperator\n`+table(lines)
	text = text.replace(/seperator/g, settings.seperator.repeat(Math.max(...text.split('\n').map(l => l.length))))
	console.log(text)
})()