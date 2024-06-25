import { useEffect, useState } from "react"
import queryString from "query-string"
import React from "react"
import ReactDOM from "react-dom"
import "./App.css"

let PayPalButton = null
function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [amount, setAmount] = useState("")
  console.log("1")
  useEffect(() => {
    console.log("useEffect")
    const parsedHash = queryString.parse(location.search)
    setAmount(parsedHash.amount)
    let timer2 = setInterval(() => {
      if (!PayPalButton) {
        // if (sessionStorage.getItem("RVCNo") && !PayPalButton) {
        updatePaypalButton()
        clearInterval(timer2)
      }
    }, 1000)
  }, [])

  function updatePaypalButton() {
    try {
      console.log("start to set PayPalButton")
      PayPalButton = window.paypal.Buttons.driver("react", {
        React,
        ReactDOM,
      })
      setIsLoading(false)
    } catch (error) {
      console.log("error", error)
    }
  }

  function _createOrder(data, actions) {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount,
          },
        },
      ],
    })
  }

  async function _onApprove(data, actions) {
    let order = await actions.order.capture()
    // console.log("order", order, data)
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(JSON.stringify(order))
    window.parent.postMessage(JSON.stringify(order), "*")
    console.log("order", order)
    return order
  }

  function _onError(err) {
    console.log(err)
    let errObj = {
      err: err,
      status: "FAILED",
    }
    window.ReactNativeWebView &&
      window.ReactNativeWebView.postMessage(JSON.stringify(errObj))
  }

  return (
    <div className='App'>
      {isLoading && !PayPalButton ? (
        <p>Loading...</p>
      ) : (
        <PayPalButton
          createOrder={(data, actions) => _createOrder(data, actions)}
          onApprove={(data, actions) => _onApprove(data, actions)}
          onCancel={() => _onError("Canceled")}
          onError={err => _onError(err)}
        />
      )}
    </div>
  )
}

export default App
