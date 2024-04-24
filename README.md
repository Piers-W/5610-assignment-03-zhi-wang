# movie rating

## accessibility 

[home](https://pagespeed.web.dev/analysis/https-5610-assignment-03-zhi-wang-vercel-app/rma1tr7q0g?form_factor=desktop&category=performance&category=accessibility&category=best-practices&category=seo&hl=en-US&utm_source=lh-chrome-ext)

[details](https://pagespeed.web.dev/analysis/https-5610-assignment-03-zhi-wang-vercel-app-details-tt1201607/890vm5jy87?form_factor=desktop&category=performance&category=accessibility&category=best-practices&category=seo&hl=en-US&utm_source=lh-chrome-ext)

[profile](https://pagespeed.web.dev/analysis/https-5610-assignment-03-zhi-wang-vercel-app-profile/e3x3z7hr37?form_factor=desktop&category=performance&category=accessibility&category=best-practices&category=seo&hl=en-US&utm_source=lh-chrome-ext)

[debugger](https://pagespeed.web.dev/analysis/https-5610-assignment-03-zhi-wang-vercel-app-debugger/lbw8xhjo7x?form_factor=desktop&category=performance&category=accessibility&category=best-practices&category=seo&hl=en-US&utm_source=lh-chrome-ext)

## How to use

You can visit at [rating](https://5610-assignment-03-zhi-wang.vercel.app/)!

1. **Home Page**: All users can view listed movies, with the profile section only appearing after logging in, allowing users to access their personal interface

2. **Authentication**: Users can sign up or log in using Auth0's Universal Login. 

3. **Profile Page**: After logging in, users can access their profile where they can modify their username and view all their comments. Clicking on a movie title within the comments will navigate them to the detail page of that movie. Additionally, clicking on 'debugger' will lead them to the debugger page

4. **detail**: The detail page will display movie details, including data fetched from RapidAPI and the score calculated by the website's database. It will also show all comments for that movie. Users are allowed to comment only once, with comments being mandatory. Users can edit or delete their comments. Refreshing the page after deleting a comment will allow users to comment again. Non-logged-in users cannot comment; clicking on the comment section will prompt them to log in. Upon logging in, users will be redirected to the page they were on before logging in

5. **Log Out**: When users are finished using NoteApp, they can log out using the provided button, which redirects them to the home page.

## Technical Details

- **CSS**: All interfaces have CSS and are adapted for computers, tablets, and mobile phones.

- **JS**: All frontends are built using React, capable of seamless communication with the backend. They can validate input data to meet backend requirements, such as disallowing empty input fields and preventing users from posting duplicate comments.

- **API endpoint**: All endpoints function properly, supporting CRUD operations and validating input data to meet requirements.

- **Security**: Utilize Auth0 for login authentication, secure routing, and distinguishing between non-logged-in users and logged-in users.

- **External API**: Retrieve movie data from RapidAPI