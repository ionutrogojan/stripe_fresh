import { Head } from "$fresh/runtime.ts";
import { stripePUB } from "../utils/striped.ts";

import PayElement from "../islands/PayElement.tsx";

export default () => {
	return (
	<>
		<Head>
			<link rel="stylesheet" href="checkout.css" />
		</Head>
		<h1>Payment</h1>
		<PayElement pubKey={stripePUB} />
	</>
  )
}
