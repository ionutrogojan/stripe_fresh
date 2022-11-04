import { Head } from "$fresh/runtime.ts";
import { asset } from "$fresh/runtime.ts";
import { stripePUB } from "../utils/striped.ts";

import PayElement from "../islands/payElement.tsx";


export default () => {
  return (
    <>
      <Head>
        <title>Striped</title>
        <link rel="stylesheet" href={asset("./global.css")} />
      </Head>
      <div>
        <PayElement pubKey={stripePUB} />
      </div>
    </>
  );
}
