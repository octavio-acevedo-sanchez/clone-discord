# Next.js 14 - AI SaaS

Discord Clone application, uses TypeScript (StandardJS), Tailwind + Shadcn/UI, MongoDB, the application only has basic functionalities. This project is a test one, it was made based on https://github.com/AntonioErdeljac/next13-discord-clone.

- Authentication using clerk/nextjs v4.29.
- Create Text, Audio and Video channels.
- Sending messages (text, emojis, image and PDF) in real time with Socket.io (v4.7) and ReactQuery (v5.28).
- Integration with uploadthing.com to upload and view image and PDF files.
- Infinite scroll.
- Option to invite a user to be a member of the channel.
- Conversations with other members of the channel.
- Search for channels and conversations.
- Integration with LiveKit.io to generate video and voice calls.

## Configure environment variables

Rename the file **.env.template** to **.env.local**

- Clerk: Create an account on https://clerk.com, create an application and then go to Api Keys and copy the values of NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

- MongoDB URL:

```
DATABASE_URL="mongodb+srv://user:password@domain.com/name_bd"
```

- UploadThing: Go to uploadthing.com, create an account, after logging in, create an app, in API Keys copy UPLOADTHING_SECRET and UPLOADTHING_APP_ID

```
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

- LiveKit: Go to liveKit.io and sign up. After logging in, create a project. Then you must go to the left menu and click in Settings, in KEYS must create a Key and then copy the variables

```
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
NEXT_PUBLIC_LIVEKIT_URL=
```

- Rebuild the node modules and build Next

```
npm install
npm run dev
```
