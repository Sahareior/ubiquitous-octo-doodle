import React from 'react';



const Similar = ({randomProducts}) => {
  return (
   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 mt-9 gap-6 py-5">
      {randomProducts?.slice(0,8).map((item) => (
        <div
          key={item.id}
          className="w-full bg-white rounded-xl shadow-md transition-transform hover:scale-105 hover:shadow-lg"
        >
          <img
            src={item.images?.[0]?.image || '/image/placeholder.png'}
            alt={item.name}
            className="h-48 w-full object-cover rounded-md mb-4"
          />
          <div className="p-4">
            <h2 className="text-[16px] popreg mb-1">{item.name}</h2>
            <p className="text-[#CBA135] text-[16px] popreg">${item.price1}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Similar;
