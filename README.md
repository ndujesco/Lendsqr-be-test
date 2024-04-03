# DEMO CREDIT APP

## DESCRIPTION

- Demo Credit is a mobile lending app that requires wallet functionality. This is needed as borrowers need a wallet to receive the loans they have been granted and also send the money for repayments.

- We use NodeJS with TypeScript as its backend software development stack which allows us to rapidly ideate and release features and functionality.

## FEATURES

- A user can create an account.
- A user can fund their account.
- A user can transfer funds to another user’s account.
- A user can withdraw funds from their account.
- A user with records in the Lendsqr Adjutor Karma blacklist cannot be onboarded.
- A user can view their transaction history.
- A user can view other user's profile.

## TECH STACK

- `NodeJS`
- `KnexJS ORM`
- `MySQL database`
- `TypeScript`

## LINKS

- [POSTMAN DOCUMENTATION](https://documenter.getpostman.com/view/20990487/2sA35JzKQ2)
- [LIVE BASE_URL](https://ugochukwu-ndujekwu-lendsqr-be-test.onrender.com/api/v1)
- [DATABASE DESIGN](https://dbdesigner.page.link/pt4ZVXxSuPuaB9pB9)

## DATABASE

- `User`
- `Wallet`
- `Transaction`

![DATABASE_DESIGN](https://github.com/ndujesco/PRACTICE_README_DOC/assets/92054718/f94821eb-b73d-4470-960c-7fb237e353df)

# ENDPOINTS

#### AUTHORIZATION REQUESTS

<details>
 <summary><code>POST</code> <code><b>/auth/signup</b></code> <code>(creates a user and a wallet)</code></summary>

##### Parameters

> | key          | value    | required | parameter type |
> | :----------- | :------- | :------- | :------------- |
> | `email`      | `string` | `true`   | `body`         |
> | `password`   | `string` | `true`   | `body`         |
> | `phone`      | `string` | `true`   | `body`         |
> | `first_name` | `string` | `true`   | `body`         |
> | `last_name`  | `string` | `true`   | `body`         |

</details>

<details>
 <summary><code>POST</code> <code><b>/auth/verification/email</b></code> <code>(verifies a user's email)</code></summary>

##### Parameters

> | key     | value    | required | parameter type |
> | :------ | :------- | :------- | :------------- |
> | `email` | `string` | `true`   | `query`        |
> | `otp`   | `string` | `true`   | `query`        |

</details>

<details>
 <summary><code>POST</code> <code><b>/auth/signin</b></code> <code>(signs in user if email is verified)</code></summary>

##### Parameters

> | key        | value    | required | parameter type |
> | :--------- | :------- | :------- | :------------- |
> | `email`    | `string` | `true`   | `body`         |
> | `password` | `string` | `true`   | `body`         |

</details>

<details>
 <summary><code>POST</code> <code><b>/auth/update/email</b></code> <code>(updates a user's email)</code></summary>

##### Parameters

> | key       | value    | required | parameter type |
> | :-------- | :------- | :------- | :------------- |
> | `email`   | `string` | `true`   | `body`         |
> | `user_id` | `string` | `true`   | `body`         |

</details>

<details>
 <summary><code>POST</code> <code><b>/auth/password</b></code> <code>(verifies user's password.)</code></summary>

##### Parameters

> `Authentication Required`
> | key | value | required | parameter type |
> | :--------- | :------- | :------- | :------------- |
> | `password` | `string` | `true` | `body` |

</details>

---

#### TRANSACTION REQUESTS

<details>
 <summary><code>POST</code> <code><b>/transaction/transfer</b></code> <code>(funds another user's account and is debited accordingly)</code></summary>

##### Parameters

> `Authentication Required`
> | key | value | required | parameter type |
> | :------------ | :-------- | :------- | :------------- |
> | `receiver_id` | `integer` | `true` | `body` |
> | `amount` | `integer` | `true` | `body` |
> | `remark` | `text` | `true` | `body` |

</details>

<details>
 <summary><code>POST</code> <code><b>/transaction/withdraw</b></code> <code>(initiates the withdrawal transaction)</code></summary>

##### Parameters

> `Authentication Required`
> | key | value | required | parameter type |
> | :------- | :-------- | :------- | :------------- |
> | `amount` | `integer` | `true` | `body` |

</details>

<details>
  <summary><code>POST</code> <code><b>/transaction/topup</b></code> <code>(initiates topup transaction)</code></summary>

##### Parameters

> | key      | value     | required | parameter type |
> | :------- | :-------- | :------- | :------------- |
> | `amount` | `integer` | `true`   | `body`         |

</details>

<details>
  <summary><code>POST</code> <code><b>/transaction/verify</b></code> <code>(verifies the withdrawal or topup transaction and completes it)</code></summary>

##### Parameters

> `Authentication Required`
> | key | value | required | parameter type |
> | :----------- | :-------- | :------- | :------------- |
> | `payment_id` | `integer` | `true` | `body` |

</details>

---

#### GET REQUESTS

<details>
  <summary><code>GET</code> <code><b>/user/my/profile</b></code> <code>(gets the logged in user's profile)</code></summary>

##### Parameters

> `Authentication Required` > `No parameters`

</details>

<details>
  <summary><code>GET</code> <code><b>/user/wallet</b></code> <code>(returns the user's wallet info)</code></summary>

##### Parameters

> `Authentication Required` > `No parameters`

</details>

<details>
  <summary><code>GET</code> <code><b>/user/transaction/type</b></code> <code>(returns the user's transactions according to the specified type)</code></summary>

##### Parameters

> `Authentication Required`
> | key | value | required | parameter type |
> | :----------------- | :---------------------------------- | :------- | :------------- |
> | `transaction_type` | `enum('topup withdrawal transfer')` | `false` | `query` |

</details>

<details>
  <summary><code>GET</code> <code><b>/user/transaction/all</b></code> <code>(returns the user's transaction by pagination)</code></summary>

##### Parameters

> `Authentication Required`
> | key | value | required | parameter type |
> | :------------ | :-------- | :------- | :------------- |
> | `page_number` | `integer` | `true` | `query` |

</details>

<details>
  <summary><code>GET</code> <code><b>/user/transaction/common</b></code> <code>(returns transactions logged in user has in common with specified user)</code></summary>

##### Parameters

> `Authentication Required`
> | key | value | required | parameter type |
> | :-------- | :-------- | :------- | :------------- |
> | `user_id` | `integer` | `true` | `query` |

</details>

<details>
  <summary><code>GET</code> <code><b>/user/profile/wallet</b></code> <code>(returns a user's profile from their wallet number)</code></summary>

##### Parameters

> `Authentication Required`
> | key | value | required | parameter type |
> | :-------------- | :-------- | :------- | :------------- |
> | `wallet_number` | `integer` | `true` | `query` |

</details>

<details>
  <summary><code>GET</code> <code><b>/user/profile/id</b></code> <code>(returns a user's profile from ID)</code></summary>

##### Parameters

> `Authentication Required`
> | key | value | required | parameter type |
> | :-------- | :-------- | :------- | :------------- |
> | `user_id` | `integer` | `true` | `query` |

</details>

<details>
  <summary><code>GET</code> <code><b>/user/profile/by</b></code> <code>(returns users profile that match the key-value)</code></summary>

##### Parameters

> `Authentication Required`
> | key | value | required | parameter type |
> | :------ | :------- | :------- | :------------- |
> | `key` | `string` | `true` | `query` |
> | `value` | `string` | `true` | `query` |

</details>

---

# PROJECT SETUP

<details>
<summary><code>CLONE THE REPO</code> </summary>

######

```bash
git clone https://github.com/ndujesco/lendsqr-be-test.git
```

</details>

<details>
<summary><code>INSTALL DEPENDENCIES</code> </summary>

######

```bash
yarn install
```

</details>

<details>
<summary><code>CREATE A DATABASE</code> </summary>

######

```mysql
CREATE DATABASE lendsqr;
```

</details>

<details>
<summary><code>CREATE A .env.development file</code> </summary>

######

- Create in the root directory
- Check `.env.example` for the variables
- `.env` will not work appropriately
- `.env.production` should be used for production

</details>

<details>
<summary><code>RUN MIGRATIONS</code> </summary>

######

```bash
yarn migrate:latest:dev
```

</details>

<details>
<summary><code>START SERVER</code> </summary>

######

```bash
yarn start:dev
```

</details>

# TESTS

<details>
<summary><code>AuthController</code> </summary>

#####

<img width="639" alt="AUTH TEST" src="https://github.com/ndujesco/lendsqr-be-test/assets/92054718/f5c83d43-8f90-4fb8-9618-d60f5fc8a754">

</details>

<details>
<summary><code>TransactionController</code> </summary>

#####

<img width="688" alt="TRANSACTION TEST" src="https://github.com/ndujesco/lendsqr-be-test/assets/92054718/9ce6f94f-6921-443a-9895-f93626162155">

</details>

<details>
<summary><code>UserContoller</code> </summary>

#####

<img width="889" alt="USER TEST" src="https://github.com/ndujesco/lendsqr-be-test/assets/92054718/c8642e46-265b-4917-a7d6-83c92852f4f7">

</details>

<details>
<summary><code>JWT</code> </summary>

#####

<img width="528" alt="JWT TEST" src="https://github.com/ndujesco/lendsqr-be-test/assets/92054718/381f8c39-76c6-4e26-99e4-90de4f8d0023">

</details>

<details>
<summary><code>ALL</code> </summary>

#####

<img width="437" alt="ALL TESTS" src="https://github.com/ndujesco/lendsqr-be-test/assets/92054718/2a7db8ce-728f-4def-b2ba-e7461b75cb2f">


</details>
