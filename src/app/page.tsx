import React from 'react';
import {ValueAverageProgram} from 'solana-value-average'

const HomePage: React.FC = () => {

  const openValueAverage = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log(e)
  }


  return (
    <div>
      <form onSubmit={openValueAverage} className='w-full'>
        <label className='label' htmlFor=''
      </form>
    </div>
  );
};

export default HomePage;