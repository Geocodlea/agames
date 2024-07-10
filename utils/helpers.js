export const sortOrder = (type, isFinished) => {
  if (type === "whist") {
    if (isFinished) {
      return [
        {
          $addFields: {
            masar2IsNull: {
              $cond: { if: { $not: ["$masar2"] }, then: 1, else: 0 },
            },
          },
        },
        {
          $sort: {
            masar2IsNull: 1, // Place non-null first, then null
            masar2: 1, // Sort non-null masar2 in ascending order
            puncter2: -1,
            licitari: -1,
          },
        },
        { $project: { masar2IsNull: 0 } }, // Optionally remove the custom field
      ];
    }

    return [{ $sort: { punctetotal: -1, procent: -1, licitari: -1 } }];
  }

  return [{ $sort: { punctetotal: -1, scorjocuri: -1, procent: -1 } }];
};

const findGame = (item) => {
  const games = {
    catan: "Catan",
    whist: "Whist",
    rentz: "Rentz",
    cavaleri: "Catan - Orașe și Cavaleri",
  };
  for (let key in games) {
    if (item.includes(key)) {
      return games[key]; // Return the display name directly
    }
  }
  return "Unknown Game"; // Directly handle unknown game case here
};

export const gameName = (event) => {
  const isOnline = event.name.includes("online");
  const isLive = event.name.includes("live");
  const mode = isOnline ? "online" : isLive ? "live" : "Campionat Național";
  const game = findGame(event.name);

  return `${game} - ${mode}`;
};
