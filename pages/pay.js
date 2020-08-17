import Head from 'next/head'
import { useState } from 'react';
import {loadStripe} from '@stripe/stripe-js';
import Countdown from "react-countdown";

const public_live_key = '<you_public_live_key>'
const public_test_key = '<you_public_test_key>'

const toMinorUnits = (amount) => {
  return Math.floor(amount*100)
}

// Countdown timer
const Timer = function() {
	const renderer = ({ hours, minutes, seconds, completed }) => {
		const style = {
			color: 'mediumvioletred'
		}
	  if (!completed) {
	    return (
	      <span className="timer" style={style}>
	        {minutes}:{seconds}
	      </span>
	    );
	  }
	};

  return <Countdown
    date={Date.now() + 5 * 60 * 1000}
    precision={2}
    renderer={renderer}
  />
}

export default function Home() {
  const [vpa, setVpa] = useState('');
  const [amount, setAmount] = useState(0);
	const [paymentState, setPaymentState] = useState('start');


	function confirm(stripe, clientSecret, vpa) {
	  setPaymentState('processing')

		stripe.confirmUpiPayment(
	    clientSecret,
	    {
	      payment_method: {
	        upi: {
	          vpa: vpa,
	        },
	      }
	    }
	  ).then(function(result) {
	    if(result.error) {
	    	setPaymentState('error')
	      console.log({result_error: result.error})
	    } else{
	    	setPaymentState('done')
	      console.log({result})
	    }
	  });
	}

	async function handlePayClick(e) {
		const stripe = await loadStripe(public_live_key, 
			{
				betas: ['upi_beta_1']
			}
		);

    e.preventDefault();
    console.log('The link was clicked.');
    const result = await fetch(`/api/create-pi?amount=${toMinorUnits(amount)}`)
    const pi = await result.json()
    const clientSecret = pi.client_secret
    console.log({pi, clientSecret})

    confirm(stripe, clientSecret, vpa)
  }

  let cta = '' 
  if (paymentState == 'start') {
  	cta = <a href="#" onClick={handlePayClick}>
    	Pay
    </a>
  }
  else if (paymentState == 'done') {
  	cta = 'Done ✅'
  }
  else if (paymentState == 'error') {
  	cta = 'error: something went wrong'
  } 
  else if (paymentState == 'processing') {
  	cta = <div>
  		<span>waiting for auth </span>
  		<span className="timer">
	  		<Timer />
  		</span>
  	</div>
  } else {
  	cta = 'something went wrong'
  }

  return (
    <div className="container">
      <Head>
        <title>Pay</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <p> VPA: </p>
      	<input className="vpa" placeholder="enter your vpa" value={vpa} onChange={e => setVpa(e.target.value)} ></input>
      	
        <p> Amount in INR: </p>
        <input className="vpa" placeholder="enter amount to be paid in INR" value={amount} onChange={e => setAmount(e.target.value)} ></input>
        <p>will create a Payment Intent for {toMinorUnits(amount)} paise (minor units)</p>
        <h2 className="title">
          {cta}
        </h2>
      </main>


      <style jsx>{`
      	.vpa {
      		height: 40px;
      		width: 400px;
          margin-bottom: 10px;
      	}


        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: left;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        footer img {
          margin-left: 0.5rem;
        }

        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .title a {
          color: #0070f3;
          text-decoration: none;
        }

        .title a:hover,
        .title a:focus,
        .title a:active {
          text-decoration: underline;
        }

        .title {
          margin: 0;
          line-height: 2.15;
          font-size: 2rem;
        }

        .title,
        .description {
          text-align: center;
        }

        .description {
          line-height: 1.5;
          font-size: 1.5rem;
        }

        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }

        .grid {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          max-width: 800px;
          margin-top: 3rem;
        }

        .card {
          margin: 1rem;
          flex-basis: 45%;
          padding: 1.5rem;
          text-align: left;
          color: inherit;
          text-decoration: none;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          transition: color 0.15s ease, border-color 0.15s ease;
        }

        .card:hover,
        .card:focus,
        .card:active {
          color: #0070f3;
          border-color: #0070f3;
        }

        .card h3 {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
        }

        .card p {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.5;
        }

        .logo {
          height: 1em;
        }

        @media (max-width: 600px) {
          .grid {
            width: 100%;
            flex-direction: column;
          }
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
