# Projet 4Desa

Clément HONORÉ

Ewen BOSQUET

Walid FADI

## Description

Le projet consiste à développer une plateforme backend "headless" pour la gestion de contenu, principalement destinée aux créateurs de contenu. Ce backend est construit avec les Azure Functions pour fournir une architecture serverless, intégrant Azure Cosmos DB pour la gestion des données et Azure Storage Account pour le stockage des médias.


## Fonctionnalités

- Création de compte
- Connexion
- Création de post
- Suppression de post
- Post de média
- Suppression de média
- Sécurisation de l'API avec JWT
- Accès à l'API avec un token

## Ossature Azure

- Azure Functions App
  - Les fonctions de l'API sont déployées sur Azure Functions.
- Azure Cosmos DB
  - Base de données NoSQL pour stocker les utilisateurs, les posts et les liens vers médias.
- Azure Blob Storage
  - Stockage des médias (images, vidéos, ...).
- Azure API Management
  - Gestion de l'API avec Azure API Management afin de centralisé et sécurisé l'accès et les appels à l'API.

![Azur Diagram](https://i.imgur.com/iw2e9F6.png)

## Prérequis (Modification des fonctions)

- Node.js 20
- Azure core tools
- Extensions Azure Functions pour VSCode

## Installation

- Cloner le projet ou extraire l'archive
- Installer les dépendances avec `npm install`
- Lancer le projet avec `npm run start`

## Fonctionnement

L'API en elle même est sécurisé avec une clé d'API fourni par Azure API Management.
Les clés d'API sont un produit qui peux être créer pour toute les personnes qui souhaitent accéder à l'API.

Toute les routes de l'API sont protégé avec un token JWT. Pour obtenir un token, il faut se connecter avec un compte existant ou en créer un nouveau.

Les routes Login et Register sont accessibles sans token.

## Routes

- Routes publiques

  - **POST** /login
  - **POST** /register

- Routes protégées

  - **GET** /media
  - **POST** /media
  - **DELETE** /media
  - **GET** /text
  - **POST** /text
  - **DELETE** /text

## Exemple de requête

### Headers

Mettre votre clé d'accès à l'API dans le header de chaque requête. Pour ce projet et afin de pouvoir utilisé l'API pour la correction, voici la clé d'API à utiliser :
35c925337c4a441b95f8ee2c8c38aff4

```http
Ocp-Apim-Subscription-Key:YOUR_SUBSCRIPTION_KEY
```
### Body
Création de compte (POST) : '/register'

```json
{
    "username": "mon-username",
    "password": "password",
    "role" : "private"
}
```

Réponse :

```json
{
  "status": 200,
  "message": "Compte créé avec succès"
}
```
Connexion (POST) : '/login'

```json
{
    "username": "mon-username",
    "password": "password"
}
```

Réponse :

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

Récupération de médias (GET) : '/media'

⚠️ Ne pas oublier de mettre le JWT dans le header de la requête. Exemple : 
    
```http
    Authorization
    Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
   ```

Réponse :

```json
{
  "status": 200,
  "message": "Médias récupérés avec succès",
  "data": [
    {
      "id": "1",
      "url": "https://url.com",
      "type": "image"
    }
  ]
}
```

