import ciao from '@homebridge/ciao';

import ResourceDiscoveryService from '@thzero/library_server/service/discovery/resources';

class MdnsResourceDiscoveryService extends ResourceDiscoveryService {
	constructor() {
		super();

		this._service = null;
	}

	async cleanup() {
		if (!this._service)
			return;

		this._service.advertise().then(() => {
			// stuff you do when the service is published
			this._logger.info2(`init DNS published`);
		});
	}

	async _initialize(correlationId, opts) {
		const packagePath = `${process.cwd()}/package.json`;
		const packageJson = require(packagePath);

		const namespace = opts.namespace ? optis.namespace : 'default';

		const name = `${packageJson.name}${namespace}.local`;

		// create a service defining a web server running on port 3000
		this._service = ciao.getResponder().createService({
			name: name,
			type: opts.secure ? 'https' : 'http',
			port: opts.port, // optional, can also be set via updatePort() before advertising
			txt: { // optional
				key: "value",
			}
		});

		this._service.advertise().then(() => {
			// stuff you do when the service is published
			this._logger.info2(`init DNS published`);
		});

		return this._success(correlationId);
	}
}

export default MdnsResourceDiscoveryService;
