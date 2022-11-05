import { Handlers, PageProps } from "$fresh/server.ts";

export const handler: Handlers = {
    async POST(req) {
        const { body } = await req.json();
        console.log(body);
        return new Response();
    }
}

export default ({ data }: PageProps) => {
    console.log(data);
    return <h1>Payment received Successfully!</h1>
}