import ciao from '@homebridge/ciao';

import LibraryUtility from '@thzero/library_common/utility';

import ResourceDiscoveryService from '@thzero/library_server/service/discovery/resources';

class MdnsResourceDiscoveryService extends ResourceDiscoveryService {
	constructor() {
		super();

		this._nameGrpc = null;
		this._nameHttp = null;

		this._serviceGrpc = null;
		this._serviceHttp = null;
	}

	get allowsHeartbeat() {
		return false;
	}

	async cleanup() {
		if (this._serviceHttp) {
			this._logger.info2(`init http DNS cleanup...`);
			this._serviceHttp.advertise().then(() => {
				this._logger.info2(`init http DNS cleaned up: ${this._nameHttp}`);
			});
		}

		if (this._serviceGrpc) {
			this._logger.info2(`init grpc DNS cleanup...`);
			this._serviceGrpc.advertise().then(() => {
				this._logger.info2(`init grpc DNS cleaned up: ${this._nameGrpc}`);
			});
		}
	}

	async _getService(correlationId, name) {
		const namespace = opts.namespace ? optis.namespace : 'default';
		if (LibraryUtility.isDev)
			namespace = 'local';

		name = `${name}.${namespace}`;
		return name;
	}

	async _initialize(correlationId, opts) {
		const packagePath = `${process.cwd()}/package.json`;
		const packageJson = require(packagePath);

		const namespace = opts.namespace ? optis.namespace : 'default';
		if (LibraryUtility.isDev)
			namespace = 'local';

		const name = `${packageJson.name}.${namespace}`;
		this._nameHttp = name;

		const optsHttp = {
			name: this._nameHttp,
			type: opts.secure ? 'https' : 'http',
			port: opts.port
		};
		if (opts.txt && Array.isArray(opts.txt))
			optsHttp.txt = opts.txt;

		this._serviceHttp = ciao.getResponder().createService(optsHttp);
		this._serviceHttp.advertise().then(() => {
			this._logger.info2(`init http DNS published: ${this._nameHttp}`);
		});

		if (opts.grpc) {
			this._nameGrpc = `grpc.${name}`;

			const optsGrpc = {
				name: this._nameGrpc,
				type: 'grpc',
				port: opts.grpc.port
			};

			if (opts.grpc.txt && Array.isArray(opts.grpc.txt))
				optsGrpc.txt = opts.grpc.txt;

			this._serviceGrpc = ciao.getResponder().createService(optsGrpc);
			this._serviceGrpc.advertise().then(() => {
				this._logger.info2(`init grpc DNS published: ${this._nameGrpc}`);
			});
		}

		return this._success(correlationId);
	}
}

export default MdnsResourceDiscoveryService;
