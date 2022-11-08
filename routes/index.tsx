import { Head, asset } from "$fresh/runtime.ts";
import { stripePUB } from "../utils/striped.ts";

import PayElement from "../islands/PayElement.tsx";

export default () => {
	return (
	<>
		<Head>
			<link rel="stylesheet" href={asset('./global.css')} />
		</Head>
		<PayElement pubKey={stripePUB} />
	</>
  )
}
