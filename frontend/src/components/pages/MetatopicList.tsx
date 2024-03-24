import React from "react";
// import metatopic from the ui folder
import Metatopic from "@/components/ui/Metatopic.tsx";
// import notecollapsed from the ui folder
import NoteCollapsed from "@/components/ui/NoteCollapsed.tsx";

interface Props {}

const MetatopicList: React.FC<Props> = ({ metatopics }) => {
  // Implement your component logic here

  return (
    <div className="max-w-md">
      {/* <Drawer.Title className="font-medium mb-4">Database</Drawer.Title> */}
      {/* Drawer Contents */}

      <div className="metatopic-list">
        {/* <NoteCollapsed
          title="Database"
          activity="Last Activity on Dec 2, 2023 at 11:34pm"
        /> */}

        {metatopics.map((metatopic) => (
          <Metatopic
            title={metatopic.name}
            activity={metatopic.createdAt}
            key={metatopics.id}
            bgcolor={metatopic.hexColor}
          />
        ))}

        {/* 
          <Metatopic
            title="Private Equity Research"
            activity="Last Activity on Dec 2, 2023 at 11:34pm"
          />
          <Metatopic
            title="AI Art"
            activity="Last Activity Today at 1:34pm"
          />
          <Metatopic
            title="Design Investment Thesis"
            activity="Last Activity on Oct 12, 2023"
          />
          <Metatopic
            title="Vedic Philosophy"
            activity="Last Activity at 2:04pm"
          /> */}
      </div>
    </div>
  );
};

export default MetatopicList;
