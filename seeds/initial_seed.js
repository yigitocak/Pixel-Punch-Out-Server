
    exports.seed = async function(knex) {
      // Deletes ALL existing entries
      await knex('users').del();
await knex('pending_users').del();
      // Inserts seed entries
      await knex('users').insert([
  {
    "id": 27,
    "username": "ozkan",
    "email": "ozkan_ayaz41@hotmail.com",
    "password": "$2b$10$VPxGn/soogZxmkp45XniJOL7PYagzBPKKyODu6EQMUYcnOiyhy3xW",
    "wins": 0,
    "losses": 0,
    "comments": [],
    "photoUrl": "https://api.ppo-online.com/profilePhotos/default.jpeg",
    "resetKey": null,
    "oAuth2": 0,
    "username_last_changed": null,
    "discordID": null,
    "oauthMethod": null,
    "admin": 0,
    "created_at": null
  },
  {
    "id": 28,
    "username": "Uni",
    "email": "yn.mr.tschiffon04@gmail.com",
    "password": "$2b$10$ttIjIHIVq.dJf5IRryGLhuD5D3JwZhQaKE90YFQ.jzrI8Z6KNsObK",
    "wins": 0,
    "losses": 0,
    "comments": [],
    "photoUrl": "https://api.ppo-online.com/profilePhotos/default.jpeg",
    "resetKey": null,
    "oAuth2": 0,
    "username_last_changed": null,
    "discordID": null,
    "oauthMethod": null,
    "admin": 0,
    "created_at": null
  },
  {
    "id": 29,
    "username": "minnieas13",
    "email": "minnieas13@gmail.com",
    "password": "$2b$10$Vi2Ty35VvbtnJHQnnzrA0Ouu7bp.wlLN0Cym5S/oVh.v3/VgT.D96",
    "wins": 0,
    "losses": 1,
    "comments": [
      {
        "comment": "wassup",
        "username": "Owen Orcan",
        "commentId": "9fa9dcec-754e-4ee6-b7a1-08c86427879f",
        "timestamp": 1716409821882,
        "usernamePhotoUrl": "https://lh3.googleusercontent.com/a/ACg8ocJ_aPDxkMNFfCwe_zbNkTPsp9uaWon-XPqUro5an-YPaqLMYW8=s96-c"
      },
      {
        "comment": "meep",
        "username": "minnieas13",
        "commentId": "1d637008-08ff-47cc-b810-805edbcb7955",
        "timestamp": 1716430015041,
        "usernamePhotoUrl": "https://api.ppo-online.com/profilePhotos/default.jpeg"
      }
    ],
    "photoUrl": "https://api.ppo-online.com/profilePhotos/default.jpeg",
    "resetKey": null,
    "oAuth2": 0,
    "username_last_changed": null,
    "discordID": null,
    "oauthMethod": null,
    "admin": 0,
    "created_at": null
  },
  {
    "id": 30,
    "username": "ZhqT",
    "email": "arif@orcan.net",
    "password": "$2b$10$J4I/pAl/0U7FDx/WELLhROwZzeZj6.hrebeGstk1D3FhEIhGQVr6.",
    "wins": 0,
    "losses": 1,
    "comments": [],
    "photoUrl": "https://api.ppo-online.com/profilePhotos/default.jpeg",
    "resetKey": "204338",
    "oAuth2": 0,
    "username_last_changed": null,
    "discordID": null,
    "oauthMethod": null,
    "admin": 0,
    "created_at": null
  },
  {
    "id": 32,
    "username": "viettrungcan",
    "email": "chuckcamosun@gmail.com",
    "password": "$2b$10$eiVPJ9lihqFBlI8vygN8UuN/FpKCchOXdmacdSU/y7BmqZYZF8VoO",
    "wins": 0,
    "losses": 0,
    "comments": [],
    "photoUrl": "https://api.ppo-online.com/profilePhotos/default.jpeg",
    "resetKey": null,
    "oAuth2": 0,
    "username_last_changed": null,
    "discordID": null,
    "oauthMethod": null,
    "admin": 0,
    "created_at": null
  },
  {
    "id": 34,
    "username": "Baba",
    "email": "lo@orcan.net",
    "password": "$2b$10$HMfJf5uDJG1nfUH3LcWIN..OfflZ2CPoPA90w2.pmx5K3U8UqIpGW",
    "wins": 0,
    "losses": 0,
    "comments": [],
    "photoUrl": "https://api.ppo-online.com/profilePhotos/default.jpeg",
    "resetKey": null,
    "oAuth2": 0,
    "username_last_changed": null,
    "discordID": null,
    "oauthMethod": null,
    "admin": 0,
    "created_at": null
  },
  {
    "id": 35,
    "username": "BuyukPatron",
    "email": "klasprogt@gmail.com",
    "password": "$2b$10$CNe9v8316.49j66IfvpnY.U0pht9UI87pTrS01W1dMjuHSDm/pBCm",
    "wins": 0,
    "losses": 0,
    "comments": [],
    "photoUrl": "https://api.ppo-online.com/profilePhotos/default.jpeg",
    "resetKey": null,
    "oAuth2": 0,
    "username_last_changed": null,
    "discordID": null,
    "oauthMethod": null,
    "admin": 0,
    "created_at": null
  },
  {
    "id": 37,
    "username": "CO68",
    "email": "cagaozer@gmail.com",
    "password": "$2b$10$CmWEquHbDrMt84gWjbp9uuuAk/u2T/07zHpWuy6pwSZyRPax.7NiO",
    "wins": 0,
    "losses": 0,
    "comments": [
      {
        "comment": "a",
        "username": "test",
        "commentId": "ffe729a2-eb55-47a5-8d6f-b698dabed72f",
        "timestamp": 1716584417227,
        "usernamePhotoUrl": "https://res.cloudinary.com/dwgpm3mdl/image/upload/v1716584359/profilePhotos/test.jpg"
      }
    ],
    "photoUrl": "https://api.ppo-online.com/profilePhotos/default.jpeg",
    "resetKey": null,
    "oAuth2": 0,
    "username_last_changed": null,
    "discordID": null,
    "oauthMethod": null,
    "admin": 0,
    "created_at": null
  },
  {
    "id": 50,
    "username": "Matt",
    "email": "mmeyer@brainstation.io",
    "password": "$2b$10$.gR9hPKbGw/CZMVXp3N93eGC.SQy0hJvhMkGM4dJgEdQE72tiV3Ny",
    "wins": 0,
    "losses": 0,
    "comments": [],
    "photoUrl": "https://api.ppo-online.com/profilePhotos/default.jpeg",
    "resetKey": null,
    "oAuth2": 0,
    "username_last_changed": null,
    "discordID": null,
    "oauthMethod": null,
    "admin": 0,
    "created_at": null
  },
  {
    "id": 51,
    "username": "donsuzenci",
    "email": "ilkeulas25@gmail.com",
    "password": "$2b$10$LCxYxvIuZP6UrH26Pbt2a.OlKzSNidKWayjZ.WB7HEBbL88iWpi32",
    "wins": 2,
    "losses": 0,
    "comments": [
      {
        "comment": "Zenci",
        "username": "ZhqT",
        "commentId": "2590f9a8-8b24-49c0-838e-d8492171547d",
        "timestamp": 1716688517018,
        "usernamePhotoUrl": "https://api.ppo-online.com/profilePhotos/default.jpeg"
      }
    ],
    "photoUrl": "https://api.ppo-online.com/profilePhotos/default.jpeg",
    "resetKey": null,
    "oAuth2": 0,
    "username_last_changed": null,
    "discordID": null,
    "oauthMethod": null,
    "admin": 0,
    "created_at": null
  },
  {
    "id": 76,
    "username": "EgehanSavuran",
    "email": "savuranegehan@gmail.com",
    "password": null,
    "wins": 1,
    "losses": 0,
    "comments": [],
    "photoUrl": "https://lh3.googleusercontent.com/a/ACg8ocKxDTWXcc25B9KwpIm_UbVH-8kyH9FP19YCKbXrBc_VyBT25l-6=s96-c",
    "resetKey": null,
    "oAuth2": 1,
    "username_last_changed": null,
    "discordID": null,
    "oauthMethod": "Google",
    "admin": 0,
    "created_at": null
  },
  {
    "id": 104,
    "username": "Alucard",
    "email": "yigitockk@gmail.com",
    "password": null,
    "wins": 0,
    "losses": 0,
    "comments": [],
    "photoUrl": "https://res.cloudinary.com/dwgpm3mdl/image/upload/v1716879334/profilePhotos/Alu.jpg",
    "resetKey": null,
    "oAuth2": 1,
    "username_last_changed": "2024-05-30T01:26:31.000Z",
    "discordID": "320182429761404930",
    "oauthMethod": "Google",
    "admin": 0,
    "created_at": null
  },
  {
    "id": 111,
    "username": "Oraa",
    "email": "owenorcan@gmail.com",
    "password": null,
    "wins": 0,
    "losses": 0,
    "comments": [],
    "photoUrl": "https://lh3.googleusercontent.com/a/ACg8ocJ_aPDxkMNFfCwe_zbNkTPsp9uaWon-XPqUro5an-YPaqLMYW8=s96-c",
    "resetKey": null,
    "oAuth2": 1,
    "username_last_changed": "2024-05-29T23:32:02.000Z",
    "discordID": null,
    "oauthMethod": "Google",
    "admin": 0,
    "created_at": "2024-05-29T23:04:37.000Z"
  }
]);
await knex('pending_users').insert([
  {
    "id": 58,
    "username": "sun25",
    "email": "christofirelee@gmail.com",
    "password": "$2b$10$qTLsWZJHP2JaUrdCdfdwqOu/ddTOkYw9BYuhCVGCic6.gsL1Ow.Xe",
    "verification_code": "817369",
    "created_at": "2024-05-22T09:51:26.000Z"
  },
  {
    "id": 72,
    "username": "ash",
    "email": "ashthetaction@gmail.com",
    "password": "$2b$10$qfh7vvCdtGyYSMphEQxrBO2MJgmr000HLbjrdAqL6.CP4SCgmS5e.",
    "verification_code": "582000",
    "created_at": "2024-05-30T01:45:31.000Z"
  }
]);
    };
  