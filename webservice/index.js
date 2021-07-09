'use strict';

const express = require('express');
const app = express();
const axios = require('axios');
const {WebhookClient} = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

app.get('/', (req, res)=>{
	res.send("We are live!");
});

app.post('/', express.json(), (req, res)=>{
	const agent = new WebhookClient({
		request : req,
		response : res
	});

	function demo(agent){
		agent.add("Sending response from Webhook server");
	}

	function recipesearch(agent){
		const food = agent.parameters.food;
		agent.add(`Here is a recipe with ` + food) + `:`;
		return axios.get(`https://raw.githubusercontent.com/much1030/cookingbot/main/recipes/${food}.json`)
			.then((result) => {
				result.data.map(recipeObj => {
					agent.add(recipeObj.name);
					agent.add(`ingredients: ` + recipeObj.ingredients);
					agent.add(`instructions: ` + recipeObj.instructions);
					// console.log(recipeObj.name + recipeObj.ingredients + recipeObj.instructions);
				});
			});
	}

	function welcome(agent) {
		agent.add(`Welcome to my agent!`);
	}

	function fallback(agent) {
		agent.add(`I didn't understand`);
		agent.add(`I'm sorry, can you try again?`);
	}

	// Run the proper function handler based on the matched Dialogflow intent name
	let intentMap = new Map();
	intentMap.set('Default Welcome Intent', welcome);
	intentMap.set('Default Fallback Intent', fallback);
	intentMap.set('recipesearch', recipesearch);
	intentMap.set('webhookDemo', demo)
	agent.handleRequest(intentMap);
});

app.listen(3333, ()=>console.log("Server is live at port 3333"));
