import PayResult from "../islands/PayResult.tsx";
import { stripePUB } from "../utils/striped.ts";

export default () => {
    return ( <> 
        <PayResult pubKey={stripePUB}/> 
    </> )
}