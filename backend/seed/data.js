// Sample data used by `npm run seed`. Keys like userKey/channelKey are only
// used to wire relationships together; MongoDB generates the real _ids.
const yt = (id) => ({
  videoUrl: `https://www.youtube.com/watch?v=${id}`,
  thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
});
const daysAgo = (d) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

export const users = [
  { key: "user01", username: "JohnDoe", email: "john@example.com", password: "Password123", avatar: "https://i.pravatar.cc/150?img=12" },
  { key: "user02", username: "JaneSmith", email: "jane@example.com", password: "Password123", avatar: "https://i.pravatar.cc/150?img=47" },
  { key: "user03", username: "AlexRivera", email: "alex@example.com", password: "Password123", avatar: "https://i.pravatar.cc/150?img=33" },
];

export const channels = [
  {
    key: "channel01",
    ownerKey: "user01",
    channelName: "Code with John",
    handle: "codewithjohn",
    description: "Coding tutorials and tech reviews by John Doe. New web development videos every week.",
    channelBanner: "https://picsum.photos/seed/codewithjohn/2048/340",
    channelAvatar: "https://i.pravatar.cc/150?img=12",
    subscribers: 5200,
  },
  {
    key: "channel02",
    ownerKey: "user02",
    channelName: "Pixel Play Studio",
    handle: "pixelplaystudio",
    description: "Game trailers, open movies and animation breakdowns curated by Jane.",
    channelBanner: "https://picsum.photos/seed/pixelplay/2048/340",
    channelAvatar: "https://i.pravatar.cc/150?img=47",
    subscribers: 18400,
  },
  {
    key: "channel03",
    ownerKey: "user03",
    channelName: "Wander & Wonder",
    handle: "wanderandwonder",
    description: "Travel films, science explainers, music and the occasional laugh.",
    channelBanner: "https://picsum.photos/seed/wanderwonder/2048/340",
    channelAvatar: "https://i.pravatar.cc/150?img=33",
    subscribers: 96100,
  },
];

export const videos = [
  // ---- Code with John ----
  { key: "video01", channelKey: "channel01", title: "Learn React in 30 Minutes", description: "A quick tutorial to get started with React.", category: "Coding", views: 15200, baseLikes: 1023, baseDislikes: 45, uploadDate: new Date("2024-09-20"), ...yt("w7ejDZ8SWv8") },
  { key: "video02", channelKey: "channel01", title: "React in 100 Seconds", description: "React is a little JavaScript library with a big influence over the web. Learn the basics in 100 seconds.", category: "Coding", views: 342000, baseLikes: 21000, baseDislikes: 190, uploadDate: daysAgo(40), ...yt("Tn6-PIqc4UM") },
  { key: "video03", channelKey: "channel01", title: "React Tutorial for Beginners", description: "Components, props, state and hooks explained step by step.", category: "Coding", views: 87400, baseLikes: 5400, baseDislikes: 60, uploadDate: daysAgo(12), ...yt("SqcY0GlETPk") },
  { key: "video04", channelKey: "channel01", title: "Next.js in 100 Seconds + Full Beginner Tutorial", description: "Server side rendering, file based routing and more with Next.js.", category: "Coding", views: 128000, baseLikes: 9800, baseDislikes: 80, uploadDate: daysAgo(3), ...yt("Sklc_fQBmcs") },
  { key: "video05", channelKey: "channel01", title: "Learn JavaScript - Full Course for Beginners", description: "Everything you need to know to start programming in JavaScript.", category: "Education", views: 2150000, baseLikes: 88000, baseDislikes: 900, uploadDate: daysAgo(210), ...yt("PkZNo7MFNFg") },
  { key: "video06", channelKey: "channel01", title: "Learn Python - Full Course for Beginners", description: "A complete Python course: variables, loops, functions, classes and more.", category: "Education", views: 4100000, baseLikes: 150000, baseDislikes: 2100, uploadDate: daysAgo(400), ...yt("rfscVS0vtbw") },
  { key: "video07", channelKey: "channel01", title: "Learn TypeScript - Full Tutorial", description: "Types, interfaces, generics and using TypeScript with React.", category: "Coding", views: 56300, baseLikes: 3100, baseDislikes: 25, uploadDate: daysAgo(20), ...yt("30LWjhZzg50") },
  { key: "video08", channelKey: "channel01", title: "What the heck is the event loop anyway?", description: "A legendary talk that finally explains the JavaScript event loop visually.", category: "Coding", views: 910000, baseLikes: 41000, baseDislikes: 300, uploadDate: daysAgo(700), ...yt("8aGhZQkoFbQ") },

  // ---- Pixel Play Studio ----
  { key: "video09", channelKey: "channel02", title: "Official Minecraft Trailer", description: "The official trailer for the Minecraft movie.", category: "Gaming", views: 1540000, baseLikes: 64000, baseDislikes: 12000, uploadDate: daysAgo(8), ...yt("MmB9b5njVbA") },
  { key: "video10", channelKey: "channel02", title: "Grand Theft Auto VI - Trailer 1", description: "Vice City, USA. The first look at GTA VI.", category: "Gaming", views: 9800000, baseLikes: 510000, baseDislikes: 9000, uploadDate: daysAgo(90), ...yt("QdBZY2fkU-0") },
  { key: "video11", channelKey: "channel02", title: "ELDEN RING - Official Gameplay Reveal", description: "Explore the Lands Between in this gameplay reveal.", category: "Gaming", views: 730000, baseLikes: 38000, baseDislikes: 700, uploadDate: daysAgo(300), ...yt("E3Huy2cdih0") },
  { key: "video12", channelKey: "channel02", title: "Big Buck Bunny 4K - Blender Open Movie", description: "The classic Blender Foundation short film in stunning 4K 60fps.", category: "Movies", views: 422000, baseLikes: 12000, baseDislikes: 150, uploadDate: daysAgo(55), ...yt("aqz-KE-bpKQ") },
  { key: "video13", channelKey: "channel02", title: "Sintel - Open Movie by Blender Foundation", description: "A lonely young woman searches for her baby dragon.", category: "Movies", views: 268000, baseLikes: 9900, baseDislikes: 120, uploadDate: daysAgo(150), ...yt("eRsGyueVLvQ") },
  { key: "video14", channelKey: "channel02", title: "Tears of Steel - Blender VFX Open Movie", description: "Sci-fi short film made with open source tools.", category: "Movies", views: 199000, baseLikes: 6100, baseDislikes: 90, uploadDate: daysAgo(15), ...yt("R6MlUcmOul8") },
  { key: "video15", channelKey: "channel02", title: "Big Buck Bunny (MP4 clip)", description: "A short MP4 clip played with the native HTML5 video player.", category: "Movies", views: 3400, baseLikes: 120, baseDislikes: 3, uploadDate: daysAgo(1), videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", thumbnailUrl: "https://i.ytimg.com/vi/YE7VzlLtp-4/hqdefault.jpg" },

  // ---- Wander & Wonder ----
  { key: "video16", channelKey: "channel03", title: "Costa Rica in 4K 60fps HDR", description: "A cinematic journey through the rainforests and beaches of Costa Rica.", category: "Travel", views: 3200000, baseLikes: 70000, baseDislikes: 1200, uploadDate: daysAgo(500), ...yt("LXb3EKWsInQ") },
  { key: "video17", channelKey: "channel03", title: "Peru 8K HDR 60FPS", description: "Machu Picchu, the Andes and the colours of Peru.", category: "Travel", views: 1800000, baseLikes: 44000, baseDislikes: 600, uploadDate: daysAgo(260), ...yt("1La4QzGeaaQ") },
  { key: "video18", channelKey: "channel03", title: "What Are You?", description: "What makes you, you? A trip through cells, atoms and consciousness.", category: "Science", views: 5600000, baseLikes: 210000, baseDislikes: 1900, uploadDate: daysAgo(120), ...yt("JQVmkDUkZT4") },
  { key: "video19", channelKey: "channel03", title: "The next outbreak? We're not ready", description: "A TED talk about pandemic preparedness.", category: "Science", views: 2900000, baseLikes: 95000, baseDislikes: 4000, uploadDate: daysAgo(900), ...yt("6Af6b_wyiwI") },
  { key: "video20", channelKey: "channel03", title: "How to Get Your Brain to Focus", description: "Productivity tips backed by research, from TEDx.", category: "Education", views: 640000, baseLikes: 22000, baseDislikes: 300, uploadDate: daysAgo(33), ...yt("Hu4Yvq-g7_Y") },
  { key: "video21", channelKey: "channel03", title: "Queen - Bohemian Rhapsody (Remastered)", description: "The official remastered video of Bohemian Rhapsody.", category: "Music", views: 8700000, baseLikes: 340000, baseDislikes: 5000, uploadDate: daysAgo(365), ...yt("fJ9rUzIMcZQ") },
  { key: "video22", channelKey: "channel03", title: "Darude - Sandstorm", description: "The timeless trance anthem.", category: "Music", views: 1250000, baseLikes: 51000, baseDislikes: 800, uploadDate: daysAgo(6), ...yt("y6120QOlsfU") },
  { key: "video23", channelKey: "channel03", title: "Funny Cat Compilation - Try Not to Laugh", description: "Cats will make you laugh your head off.", category: "Comedy", views: 460000, baseLikes: 13000, baseDislikes: 400, uploadDate: daysAgo(2), ...yt("hY7m5jjJ9mM") },
  { key: "video24", channelKey: "channel03", title: "Me at the zoo", description: "The very first video ever uploaded to YouTube.", category: "Comedy", views: 330000, baseLikes: 17000, baseDislikes: 350, uploadDate: daysAgo(1000), ...yt("jNQXAC9IVRw") },
];

export const comments = [
  { videoKey: "video01", userKey: "user02", text: "Great video! Very helpful.", createdAt: new Date("2024-09-21T08:30:00Z") },
  { videoKey: "video01", userKey: "user03", text: "Finally understood hooks. Thanks John!", createdAt: new Date("2024-09-22T10:10:00Z") },
  { videoKey: "video02", userKey: "user03", text: "100 seconds well spent.", createdAt: daysAgo(30) },
  { videoKey: "video12", userKey: "user01", text: "Still one of the best open movies ever made.", createdAt: daysAgo(20) },
  { videoKey: "video16", userKey: "user02", text: "The colours in this are unreal. Adding Costa Rica to my list.", createdAt: daysAgo(10) },
  { videoKey: "video21", userKey: "user01", text: "Is this the real life? Is this just fantasy?", createdAt: daysAgo(5) },
];
