import ciao from '@homebridge/ciao';

import LibraryUtility from '@thzero/library_common/utility';

import BaseService from '@thzero/library_server/service';

class MdnsService extends BaseService {
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
			this._enforceNotEmpty('MdnsService', 'initialize', opts, 'opts', correlationId);
			this._enforceNotEmpty('MdnsService', 'initialize', opts.address, 'address', correlationId);
			this._enforceNotNull('MdnsService', 'initialize', opts.port, 'port', correlationId);

			return await this._initialize(correlationId, opts);
		}
		catch(err) {
			return this._error('MdnsService', 'initialize', null, err, null, null, correlationId);
		}
	}

	async _initialize(correlationId, opts) {
		const packagePath = `${process.cwd()}/package.json`;
		const packageJson = require(packagePath);

		const namespace = opts.namespace ? optis.namespace : 'default';
		if (LibraryUtility.isDev)
			namespace = 'local';

		this._name = `${packageJson.name}.${namespace}`;

		const opts = {
			name: this._name,
			type: opts.secure ? 'https' : 'http',
			port: opts.port
		};
		if (opts.txt && Array.isArray(opts.txt))
			opts.txt = opts.txt;

		this._service = ciao.getResponder().createService(opts);
		this._service.advertise().then(() => {
			this._logger.info2(`init http DNS published: ${this._name}`);
		});

		return this._success(correlationId);
	}
}

export default MdnsMdnsService;
