import ciao from '@homebridge/ciao';

import LibraryUtility from '@thzero/library_common/utility';

import DiscoveryService from '@thzero/library_server/service/discovery';

class MdnsDiscoveryService extends DiscoveryService {
	constructor() {
		super();

		this._name = null;

		this._service = null;
	}

	async cleanup() {
		if (this._service) {
			this._logger.info2(`init http DNS cleanup...`);
			this._service.advertise().then(() => {
				this._logger.info2(`init http DNS cleaned up: ${this._name}`);
			});
		}
	}

	// options { name, ttl, description }
	async initialize(correlationId, opts) {
		try {
			this._enforceNotEmpty('MdnsDiscoveryService', 'initialize', opts, 'opts', correlationId);
			this._enforceNotEmpty('MdnsDiscoveryService', 'initialize', opts.address, 'address', correlationId);
			this._enforceNotNull('MdnsDiscoveryService', 'initialize', opts.port, 'port', correlationId);

			const local = this._config.get('dns.local', false);
			if (!local) {
				this._logger.warn('MdnsDiscoveryService', 'initialize', 'Did not initialize MDNS as not DNS is not specified as local.', null, correlationId);
				return this.-this._success(correlationId);
			}

			return await this._initialize(correlationId, opts);
		}
		catch(err) {
			return this._error('MdnsDiscoveryService', 'initialize', null, err, null, null, correlationId);
		}
	}

	async _initialize(correlationId, opts) {
		const packagePath = `${process.cwd()}/package.json`;
		const packageJson = require(packagePath);

		let namespace = opts.namespace ? optis.namespace : 'default';

		this._name = `${packageJson.name}.${namespace}`;

		const optsI = {
			name: this._name,
			type: opts.secure ? 'https' : 'http',
			port: opts.port
		};
		if (opts.txt && Array.isArray(opts.txt))
			optsI.txt = opts.txt;

		this._service = ciao.getResponder().createService(optsI);
		this._service.advertise().then(() => {
			this._logger.info2(`init http DNS published: ${this._name}`);
		});

		return this._success(correlationId);
	}
}

export default MdnsDiscoveryService;
