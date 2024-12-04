# Projet 4Desa

Clément HONORÉ

Ewen ?

Walid FADI

## Description

Ce projet a pour but de fournir un backend pour la gestion d'application de réseaux sociaux.

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

![Diagramme Azur](azur.png)

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
fb18d458ee8b49449f964ed7038c738e

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

