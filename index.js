import 'dotenv/config'
import { Telegraf } from 'telegraf'
import axios from 'axios'
import { getInfo } from './createresp.js'

// prefuncs

let pokenames = []
let maxpoke = 0
axios.get(`https://pokeapi.co/api/v2/pokemon?limit=100000`).then(res => {pokenames = res.data.results.map(pokemon => pokemon.name); maxpoke = res.data.count})

const ctch = (err) => {console.log(err)}

const autocomplete = (query) => {
    if (!query) return pokenames.slice(0, 10);
    query = query.toLowerCase();
    const suggestions = pokenames.filter(pokemon => pokemon.startsWith(query));
    return suggestions.slice(0, 10);
}

// bot

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start(ctx => {
    ctx.reply(`
<b>Welcome to the Pokédex bot!</b>

Using this bot is simple: Just type the name of the Pokémon you want to look up and select it from the list.
Then click the button below and click an image. You will see the detailed information about the Pokémon you've selected.

Enjoy!
<i>Created by @ZAZiOs, using <a href="http://pokeapi.co">pokeapi.co</a></i>`, {parse_mode: 'HTML', reply_markup: {inline_keyboard: [[{text: '🔍 Search Pokémon', switch_inline_query_current_chat: ''}]], link_preview_options: {is_disabled: true}}})
})

bot.on('inline_query', async ctx => {
    let { query } = ctx.inlineQuery
    query = query.replace(/^0+/, "")
    if ((Number(query) > 0 && Number(query) <= maxpoke) || (pokenames.indexOf(query.toLowerCase()) + 1)) {
        let data = await getInfo(query)
        if (data.error) {
            return ctx.answerInlineQuery([
                {
                    type: 'article',
                    id: '0',
                    title: 'An error occured. Try again pls!',
                    input_message_content: {
                        message_text: 'An error occured. Try again pls!\nYour query: <b>' + query + '</b>'
                    }
                }
            ], {cache_time: 0}).catch(ctch)
        }

        function createMatrix(elements) {     
            let matrix = [];
            for (let i = 0; i < elements.length; i += 2) {
                let el1 = elements[i];
                let el2 = elements[i + 1];
                if (data.name == el1.species) el1.species = elements[0].was
                if (data.name == el2.species) el2.species = elements[0].was
                matrix.push([{switch_inline_query_current_chat: el1.species, text: `Lookup ${el1.species}`}, {switch_inline_query_current_chat: el2.species, text: `Lookup ${el2.species}`}]); // Пары
                elements.slice(i, i + 2)
            }
            matrix.push([{switch_inline_query_current_chat: ' ', text: 'Search another Pokémon'}])
            return matrix;
        }


        let reply_markup = {inline_keyboard: createMatrix(data.evolutionTriggers)}
    

        let evolution_tree = data.evolutionTriggers.map((evolution, index) => {
            let { was, species, trigger, value } = evolution
            return `${was} → <b>${species}</b>\n`+
                   `Triggered by <b>${trigger}</b>\n` +
                   `Required to trigger: <b>${value}</b>\n\n`
        })

        ctx.answerInlineQuery([
            {
                type: 'photo',
                id: data.id,
                photo_url: data.image,
                thumb_url: data.image,
                title: data.name,
                caption: `<code>${data.name}</code> <b>№${data.id}</b>\n` +
                         `<i>${data.description}</i>\n\n` +

                         `<b>Types:</b> <b>${data.types.join('</b>, <b>')}</b>\n` +
                         `<b>Weaknesses:</b> <b>${data.weaknesses.join('</b>, <b>')}</b>\n\n` +

                         `<b>Height:</b> ${data.height}m\n` +
                         `<b>Weight:</b> ${data.weight}kg\n` +
                         `<b>Category:</b> ${data.category}\n\n` +

                         `<b>Abilities:</b> \n- <b>${data.abilities.join('</b>\n- <b>')}</b>\n\n` +

                         `<b>----- Evolution chain -----</b>\n${evolution_tree.join('')}`,
                parse_mode: 'HTML',
                reply_markup
            }
        ], {cache_time: 0}).catch(ctch)
        return
    }

    const results = autocomplete(ctx.inlineQuery.query)
    const pokemon = results.map((pokemon, index) => ({
        type: 'article',
        id: String(index),
        title: pokemon,
        input_message_content: {
            message_text: `You've selected <code>${pokemon}</code>\nClick the button below to open the pokédex page`,
            parse_mode: 'HTML'
        },
        reply_markup: {inline_keyboard: [[{switch_inline_query_current_chat: pokemon, text: `Lookup ${pokemon}`}]]}
    }))
    return ctx.answerInlineQuery(pokemon, {cache_time: 0}).catch(ctch)
})
bot.launch()