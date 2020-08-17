const private_test_key = '<you_private_test_key>'
const private_live_key = '<you_private_live_key>'

const stripe = require('stripe')(private_live_key);

export default async (req, res) => {
	const {amount} = req.query

	// Best Practice: 
	// We recommend creating a PaymentIntent as soon as the amount is known, 
	// such as when the customer begins the checkout process, to help track your sales funnel. 
	const paymentIntent = await stripe.paymentIntents.create({
	  payment_method_types: ['upi'],
	  amount: Number(amount),
	  currency: 'inr',
	});

	console.log({pi: paymentIntent.id})
	
	res.end(JSON.stringify(paymentIntent))
}