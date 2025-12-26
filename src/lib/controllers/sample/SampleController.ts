import { BackendMethod } from 'remult';
import { Returns } from '$lib/utils/openApi';

export class SampleController {
	@BackendMethod({ allowed: true })
	@Returns({ type: 'string' })
	static async getSample() {
		return 'Hello, world!';
	}
}
