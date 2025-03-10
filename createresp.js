import axios from 'axios'

// i want to kms xD

Object.defineProperty(String.prototype, 'capitalize', {
    value: function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
    enumerable: false
  });

const ctch = (err) => {console.log(err)}

export const getInfo = async (pokemon) => {
    try {
    let pokeData = (await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.toLowerCase()}`).catch(() => {}))?.data
    if (!pokeData) return {error: 404}
    let pokeSpecies = (await axios.get(pokeData.species.url).catch(ctch)).data
    let pokeEvolution = (await axios.get(pokeSpecies.evolution_chain.url).catch(ctch)).data
    let pokeType = (await axios.get(pokeData.types[0].type.url).catch(ctch)).data

    let response = {
        image: pokeData.sprites.other["official-artwork"].front_default || pokeData.sprites.front_default,
        name: pokeData.name.capitalize(),
        id: pokeData.id.toString().padStart(4, '0'),
        description: getRandomFlavorText(pokeSpecies.flavor_text_entries),
        types: pokeData.types.map(type => type.type.name.capitalize()),
        weaknesses: pokeType.damage_relations.double_damage_from.map(type => type.name.capitalize()),
        height: pokeData.height / 10,
        weight: pokeData.weight / 10,
        category: pokeSpecies.genera.find(genus => genus.language.name === "en").genus || "Not found", 
        abilities: getAbilities(pokeData.abilities),
        evolutionTriggers: getEvolutionTriggers(pokeEvolution)
    }  
    return response
    } catch (err) {
        console.log(err)
        return {error: "An error occured"}
    }
}

function getRandomFlavorText(flavor_text_entries) {
    const filteredText = flavor_text_entries
      .filter(entry => entry.language.name === "en") 
      .map(entry => entry.flavor_text);
  
    const randomIndex = Math.floor(Math.random() * filteredText.length);
    return filteredText[randomIndex].replaceAll('\n', ' ');
  }

function getAbilities(abilities) {
    let result = []

    for (let ability of abilities) {
        if (ability.is_hidden) result.push(`✳️ ${ability.ability.name.capitalize()}`)
        else result.push(`✅ ${ability.ability.name.capitalize()}`)
    }
    return result
}

function getEvolutionTriggers(data) {
    const triggerMapping = {
      "level-up": "Level Up",
      "use-item": "Using an Item",
      "trade": "Trade",
      "affection": "High Affection",
      "happiness": "High Happiness",
      "time-of-day": "Time of Day",
      "shed": "Shed",
      "other": "Other"
    };
    
    const evolutionChain = data.chain;
    const uniqueEvolutions = new Set();
    function extractSimplifiedEvolutionDetails(chain, was) {
      const evolutions = [];
      if (chain.evolution_details && chain.evolution_details.length > 0) {
        for (const detail of chain.evolution_details) {
          const trigger = {
            was,
            species: chain.species.name.capitalize(),
            trigger: triggerMapping[detail.trigger.name] || detail.trigger.name,
            value: getEvolutionDetailValue(detail)
          };
  
          if (!uniqueEvolutions.has(chain.species.name)) {
            uniqueEvolutions.add(chain.species.name);
            evolutions.push(trigger);
          }
        }
      }
  
      if (chain.evolves_to.length > 0) {
        for (const evolution of chain.evolves_to) {
          evolutions.push(...extractSimplifiedEvolutionDetails(evolution, chain.species.name.capitalize()));
        }
      }
  
      return evolutions;
    }
  
    function getEvolutionDetailValue(detail) {
      if (detail.min_level) return `Level ${detail.min_level}`;
      if (detail.item?.name) return `Item: ${detail.item.name}`;
      if (detail.min_happiness) return `Happiness: ${detail.min_happiness}`;
      if (detail.min_affection) return `Affection: ${detail.min_affection}`;
      if (detail.time_of_day) return `Time of Day: ${detail.time_of_day}`;
      return 'N/A';
    }

    const simplifiedEvolutionDetails = extractSimplifiedEvolutionDetails(evolutionChain);
    return simplifiedEvolutionDetails;
  }