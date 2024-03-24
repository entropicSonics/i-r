import React from "react";

interface Props {
  // Define the props for your component here
  title: string;
  activity: string;
  bgcolor: string;
}

const Metatopic: React.FC<Props> = ({ title, activity, bgcolor }) => {
  // Implement your component logic here

  return (
    <div className="metatopic py-4 border-b-2 border-slate-100 px-2">
      {/* Render your component UI here */}
      <div className="flex items-center justify-start pt-2">
        <h1 className="text-base font-medium mb-2">{title}</h1>
        <div
          className="color-code w-14 h-2 ml-2 mb-2 rounded-full"
          style={{
            backgroundColor: bgcolor,
          }}
        ></div>
      </div>
      <p className="text-xs mb-4 text-slate-500">{activity}</p>
    </div>
  );
};

export default Metatopic;
