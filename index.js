import ciao from '@homebridge/ciao';

import DiscoveryService from '@thzero/library_server/service/discovery';

class MdnsDiscoveryService extends DiscoveryService {
	constructor() {
		super();

		this._name = null;

		this._service = null;
	}

	async cleanup() {
		if (this._service) {
			this._logger.info2(`init DNS cleanup '${this._name}'...`);
			this._service.advertise().then(() => {
				this._logger.info2(`init DNS cleaned up: ${this._name}`);
			});
		}
	}

	// options { name, ttl, description }
	async initialize(correlationId, opts) {
		try {
			this._enforceNotEmpty('MdnsDiscoveryService', 'initialize', opts, 'opts', correlationId);
			this._enforceNotEmpty('MdnsDiscoveryService', 'initialize', opts.address, 'address', correlationId);
			this._enforceNotNull('MdnsDiscoveryService', 'initialize', opts.port, 'port', correlationId);

			if (!opts.dns && !opts.dns.local) {
				this._logger.warn('MdnsDiscoveryService', 'initialize', 'Did not initialize MDNS as not DNS is not specified as local.', null, correlationId);
				return this._success(correlationId);
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

		const label = !String.isNullOrEmpty(opts.dns.label) ? opts.dns.label : packageJson;
		this._name = `${label}.local`;

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
