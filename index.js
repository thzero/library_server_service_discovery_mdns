import ciao from '@homebridge/ciao';

import ResourceDiscoveryService from '@thzero/library_server/service/discovery/resources';

class MdnsResourceDiscoveryService extends ResourceDiscoveryService {
	constructor() {
		super();

		this._serviceGrpc = null;
		this._serviceHttp = null;
	}

	get allowsHeartbeat() {
		return true;
	}

	async cleanup() {
		if (!this._service)
			return;

		if (this._serviceHttp != null) {
			this._serviceHttp.advertise().then(() => {
				// stuff you do when the service is published
				this._logger.info2(`init http DNS published`);
			});
		}

		if (this._serviceGrpc != null) {
			this._serviceGrpc.advertise().then(() => {
				// stuff you do when the service is published
				this._logger.info2(`init grpc DNS published`);
			});
		}
	}

	async _initialize(correlationId, opts) {
		const packagePath = `${process.cwd()}/package.json`;
		const packageJson = require(packagePath);

		const namespace = opts.namespace ? optis.namespace : 'default';

		const name = `${packageJson.name}${namespace}.local`;

		const optsHttp = {
			name: name,
			type: opts.secure ? 'https' : 'http',
			port: opts.port
		};
		if (opts.txt && Array.isArray(opts.txt))
			optsHttp.txt = opts.txt;

		this._serviceHttp = ciao.getResponder().createService(optsHttp);
		this._serviceHttp.advertise().then(() => {
			this._logger.info2(`init http DNS published`);
		});

		if (opts.grpc) {
			const optsGrpc = {
				name: `{grpc}.name`,
				type: 'grpc',
				port: opts.grpc.port
			};

			if (opts.grpc.txt && Array.isArray(opts.grpc.txt))
				optsGrpc.txt = opts.grpc.txt;

			this._serviceGrpc = ciao.getResponder().createService(optsGrpc);
			this._serviceGrpc.advertise().then(() => {
				this._logger.info2(`init grpc DNS published`);
			});
		}

		return this._success(correlationId);
	}
}

export default MdnsResourceDiscoveryService;
