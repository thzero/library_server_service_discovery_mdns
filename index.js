import fs from 'fs';
import path from 'path';

import ciao from '@homebridge/ciao';

import DiscoveryService from '@thzero/library_server/service/discovery/index.js';

class MdnsDiscoveryService extends DiscoveryService {
	constructor() {
		super();

		this._name = null;

		this._service = null;
	}

	async cleanup() {
		if (!this._service)
			return;

		this._logger.info2(`init DNS cleanup '${this._name}'...`);
		this._service.end().then(() => {
			this._logger.info2(`init DNS cleaned up: ${this._name}`);
			this._service.destroy();
		}).catch(() => {
			this._service.destroy();
		});
	}

	// options { name, ttl, description }
	async initializeDiscovery(opts) {
		try {
			this._enforceNotEmpty('MdnsDiscoveryService', 'initializeDiscovery', opts, 'opts', null);
			this._enforceNotNull('MdnsDiscoveryService', 'initializeDiscovery', opts.port, 'port', null);

			if (!opts.dns && (opts.dns && !opts.dns.local)) {
				this._logger.warn('MdnsDiscoveryService', 'initializeDiscovery', 'Did not initialize MDNS as not DNS is not specified as local.', null, null);
				return this._success();
			}

			return await this._initializeDiscovery(opts);
		}
		catch(err) {
			return this._error('MdnsDiscoveryService', 'initializeDiscovery', null, err, null, null, correlationId);
		}
	}

	async _initializeDiscovery(opts) {
		let label = !String.isNullOrEmpty(opts.dns && opts.dns.label) ? opts.dns.label : null;
		if (String.isNullOrEmpty(label)) {
			this._logger.info2(`init http DNS package json fallback...`);
			const packagePath = path.join(process.cwd(), 'package.json');
			const file = fs.readFileSync(packagePath, 'utf8');
			if (String.isNullOrEmpty(file))
				throw Error('Invalid package.json file for mdns; expected in the <app root> folder.');

			const packageJson = JSON.parse(file);
			if (!packageJson)
				throw Error('Invalid package.json file for mdns.');

			let packageName = packageJson.name;
			if (String.isNullOrEmpty(packageName))
				throw Error('Invalid name in the package.json file for mdns.');
			let splitName = packageName.split('/');
			if (!splitName)
				throw Error('Invalid name in the package.json file for mdns.');
			if (splitName.length === 0)
				throw Error('Invalid name in the package.json file for mdns.');
			label = splitName[splitName.length > 1 ? 1 : 0];
		}
		if (String.isNullOrEmpty(label))
			throw Error('Invalid label for mdns.');
		this._name = `${label}.local`;

		let restrictedAddresses = null;
		if (opts.address && opts.address !== '0.0.0.0')
			restrictedAddresses = [ opts.address ];

		const optsI = {
			name: this._name,
			type: opts.secure ? 'https' : 'http',
			port: opts.port,
			restrictedAddresses: restrictedAddresses
		};
		if (opts.txt && Array.isArray(opts.txt))
			optsI.txt = opts.txt;

		this._service = ciao.getResponder().createService(optsI);
		this._service.advertise().then(() => {
			this._logger.info2(`init http DNS published: ${this._name}`);
		}).catch(() => {
			this._service.destroy();
		});

		return this._success();
	}
}

export default MdnsDiscoveryService;
