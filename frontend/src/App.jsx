import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='bg-red-400 md:bg-amber-300'>
        Hi there
      </div>
    </>
  )
}

export default App
