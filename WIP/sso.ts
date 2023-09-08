import { Context, Controller, Get, PlatformContext } from "@tsed/common"
import { BaseController } from "@utils/classes"
import DiscordOAuth2 from 'discord-oauth2'
import { Database } from "@services";
import { Client } from "discordx";
import { resolveDependencies } from "@utils/functions";
import { User } from "@entities";

@Controller('/sso')
export class SsoController extends BaseController {
    private client: Client
    private db: Database

	constructor() {
        super();
        
        resolveDependencies([Client, Database]).then(([client, db]) => {
            this.client = client
            this.db = db
        })
    }

    
    @Get('/discord')
    async callback(@Context() ctx: Context) {
        // if request is from a known source, allow that origin
        // TODO: allow more sources as needed
        if ((ctx.request.headers.origin === `${process.env.WEBSITE_URL}`)) {
            ctx.response.setHeaders({
                'Access-Control-Allow-Origin': process.env.WEBSITE_URL,
            });
        }

        const { code } = ctx.request?.query;
        if (!code) {
            return 'No code provided';
        }
        
        const oauth = new DiscordOAuth2({
            clientId: `${process.env.BOT_APP_ID}`,
            clientSecret: `${process.env.BOT_SECRET}`,
            redirectUri: process.env.DASHBOARD_URL,
        });

        const auth = await oauth.tokenRequest({
            scope: ['identify'],
            code,
            grantType: 'authorization_code',
        }).catch(err => console.error(JSON.stringify(err?.response, null, 2)));
        
        const user = await oauth.getUser(`${auth?.access_token}`)
            .catch(err => console.error(JSON.stringify(err?.response, null, 2)));
            
        // console.log(this.client.botGuilds);
        
        // is player?
        const data = await this.db.get(User).findOne({id: user?.id})
            .catch(err => console.error(JSON.stringify(err?.response, null, 2)));

        // validate auth token
        const response = {
            sso: 'discord',
            auth, // needed for further auth requests
            user,
            data,
            // or gm?,
        };

        ctx.response.contentType("application/json");
        return response;
    }
}
