import { Head, asset } from "$fresh/runtime.ts";
import { stripePUB } from "../utils/striped.ts"; // utils import

import PayElement from "../islands/PayElement.tsx";

export default () => {
	return (
	<>
		<Head>
			<link rel="stylesheet" href={asset('./global.css')} />
		</Head>
		<PayElement pubKey={stripePUB} /> {/* Stripe Payment Island */}
	</>
  )
}
