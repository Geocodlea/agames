const FILE_SIZE = 10000000; // 10 MB
const FILE_SIZE_TEXT = "File size is too large, max 10 MB";
const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/gif",
  "image/png",
  "image/webp",
];
const SUPPORTED_FORMATS_TEXT =
  "Unsupported file type, accepted formats: jpg, jpeg, gif, png, webp";
const LEADERBOARD_POINTS = [100, 70, 50, 35, 25];

const sortOrder = (type, isFinished) => {
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

// Old Events Names
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

const gameName = (event) => {
  const isOnline = event.name.includes("online");
  const isLive = event.name.includes("live");
  const mode = isOnline ? "online" : isLive ? "live" : "Campionat Național";
  const game = findGame(event.name);

  return `${game} - ${mode}`;
};

// Old Events Date
const oldEventsDate = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

// Events Dates
const formatedDate = (date) => {
  return date.toLocaleString("ro-RO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const calendarFormatedDate = (dateStr) => {
  // Create a Date object from the input date string
  const date = new Date(dateStr);

  // Get the year, month, and day
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed, so add 1
  const day = String(date.getDate()).padStart(2, "0");

  // Construct the date string in YYYY-MM-DD format
  return `${year}-${month}-${day}`;
};

const getNextEventDay = (date) => {
  const day = date.getUTCDay();
  const nextEventDay = new Date(date);
  nextEventDay.setUTCDate(date.getUTCDate() + ((8 - day) % 7));
  nextEventDay.setUTCHours(0, 0, 0, 0);
  return nextEventDay;
};

const getEventDates = (type, date, calendar) => {
  const dbDate = new Date(date);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // If the date is in the future, return the formatted date
  if (dbDate >= today) {
    if (calendar) {
      return calendarFormatedDate(dbDate);
    }
    return formatedDate(dbDate);
  }

  // Calculate the first EventDay from today
  let firstEventDay = getNextEventDay(today);

  // If today is an EventDay, consider today as the starting point
  if (today.getUTCDay() === 1) {
    firstEventDay = today;
  }

  // Reference date (a known "every other date")
  let referenceDate = new Date("2024-07-08T00:00:00.000+00:00"); // Catan
  if (type === "cavaleri") {
    referenceDate = new Date("2024-07-02T00:00:00.000+00:00");
  }
  if (type === "whist") {
    referenceDate = new Date("2024-07-09T00:00:00.000+00:00");
  }
  if (type === "rentz") {
    referenceDate = new Date("2024-07-02T00:00:00.000+00:00");
  }

  // Ensure reference date has the correct time (midnight UTC)
  referenceDate.setUTCHours(0, 0, 0, 0);

  // Calculate the number of days between the reference date and the first EventDay
  const daysDifference = Math.floor(
    (firstEventDay - referenceDate) / (1000 * 60 * 60 * 24)
  );

  // Calculate the number of 14-day periods between the reference date and the first EventDay
  const periods = Math.ceil(daysDifference / 14);

  // Calculate the closest "every other EventDay" from the reference date
  const closestEveryOtherEventDay = new Date(referenceDate);
  closestEveryOtherEventDay.setUTCDate(
    referenceDate.getUTCDate() + periods * 14
  );

  // Ensure the closest "every other EventDay" is in the future
  if (closestEveryOtherEventDay <= today) {
    closestEveryOtherEventDay.setUTCDate(
      closestEveryOtherEventDay.getUTCDate() + 14
    );
  }

  if (calendar) {
    return calendarFormatedDate(closestEveryOtherEventDay);
  }
  return formatedDate(closestEveryOtherEventDay);
};

// Formatted Event Names
const eventName = (type) =>
  type === "cavaleri"
    ? "Catan - Orașe și Cavaleri"
    : type.charAt(0).toUpperCase() + type.slice(1);

export {
  FILE_SIZE,
  FILE_SIZE_TEXT,
  SUPPORTED_FORMATS,
  SUPPORTED_FORMATS_TEXT,
  LEADERBOARD_POINTS,
  sortOrder,
  gameName,
  oldEventsDate,
  getEventDates,
  eventName,
};
