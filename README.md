# Data Center 3D Platform

## Aperçu

La Plateforme 3D pour Data Center est une solution full-stack complète, conçue pour la surveillance et la gestion avancées de l'infrastructure d'un centre de données. Elle représente une avancée significative par rapport aux tableaux de bord 2D traditionnels en offrant une visualisation 3D immersive et interactive de l'ensemble de l'installation. Les administrateurs et les opérateurs peuvent naviguer dans un modèle virtuel du centre de données, inspecter les équipements en temps réel et recevoir des alertes instantanées, ce qui permet des temps de réponse plus rapides et une gestion opérationnelle plus intuitive.

Cette plateforme répond au besoin critique d'obtenir des informations détaillées et en temps réel sur l'environnement physique d'un centre de données, y compris les mesures de sécurité, de puissance et de refroidissement. En intégrant des flux de données en direct dans un contexte 3D, elle aide à identifier rapidement les problèmes, à optimiser l'allocation des ressources et à renforcer la sécurité physique.

## Fonctionnalités Principales

*   **Visualisation 3D Immersive :**
    *   Naviguez dans un modèle 3D détaillé et interactif du centre de données, incluant la structure du bâtiment, les salles de serveurs et les baies individuelles.
    *   Les modèles sont rendus à l'aide de **Three.js** et de **React Three Fiber**, offrant une expérience utilisateur performante et visuellement riche.
    *   Inspectez l'état et les métriques des équipements en cliquant simplement sur les objets 3D correspondants.

*   **Surveillance d'Infrastructure en Temps Réel :**
    *   Mises à jour en direct des métriques critiques telles que la température, la consommation d'énergie (PUE) et l'humidité provenant de divers capteurs.
    *   Les données sont transmises depuis le backend via des **WebSockets (Socket.IO)**, garantissant que le tableau de bord reflète l'état actuel de l'installation sans délai.
    *   Visualisez les tendances des données et les performances historiques à l'aide de graphiques intégrés (**Chart.js**).

*   **Système d'Alerte Avancé :**
    *   Configurez des règles et des seuils personnalisés pour toute métrique surveillée (par exemple, la température d'une baie dépassant une certaine limite).
    *   Recevez des notifications immédiates à l'écran lorsqu'une alerte est déclenchée.
    *   Visualisez l'emplacement physique d'une alerte directement dans le modèle 3D, permettant une localisation rapide du problème.

*   **Gestion de la Sécurité par Zones :**
    *   Définissez des zones de sécurité distinctes au sein du centre de données (par exemple, zones de haute sécurité, zones de refroidissement).
    *   Surveillez et enregistrez les événements d'accès, fournissant une piste d'audit claire de toutes les entrées et activités physiques.
    *   Visualisez les limites des zones et leur statut de sécurité directement dans l'environnement 3D.

*   **Gestion des Équipements et des Baies :**
    *   Tenez un inventaire détaillé de toutes les baies de serveurs et des équipements qu'elles contiennent.
    *   Suivez l'état de fonctionnement, le modèle et le cycle de vie de chaque pièce de matériel.
    *   Le système permet d'ajouter, de mettre à jour et de gérer l'ensemble du cycle de vie des équipements via une interface conviviale.

## Architecture Technique

La plateforme est construite sur une architecture full-stack moderne et découplée, garantissant évolutivité et maintenabilité.

*   **Frontend :** Une application à page unique (SPA) construite avec **React** et **TypeScript**. Elle gère toutes les interactions utilisateur et le rendu.
    *   **Vite** sert d'outil de build pour une expérience de développement rapide.
    *   **Three.js** et **React Three Fiber** sont au cœur de la visualisation 3D.
    *   **Zustand** est utilisé pour une gestion d'état globale efficace et légère.
    *   **Tailwind CSS** assure le style des composants de l'interface utilisateur.
    *   **Socket.IO Client** se connecte au backend pour recevoir les flux de données en temps réel.

*   **Backend :** Un service d'API robuste construit avec **Node.js**, **Express.js** et **TypeScript**.
    *   Il fournit des données au frontend via une API RESTful pour le chargement initial des données et utilise une connexion WebSocket pour les mises à jour en temps réel.
    *   **Socket.IO** gère le serveur WebSocket, poussant les données en direct des capteurs et des alertes à tous les clients connectés.
    *   **Joi** est utilisé pour une validation robuste des requêtes API entrantes.

*   **Base de données :** **PostgreSQL** est le magasin de données principal, contenant les informations sur les zones, les baies, les équipements, les capteurs et les configurations d'alerte. Le service backend communique avec la base de données à l'aide de la bibliothèque cliente `pg`.

*   **Conteneurisation :** L'ensemble de l'application (frontend, backend, base de données) est conteneurisé à l'aide de **Docker** et orchestré avec **Docker Compose**. Cela simplifie la configuration du développement et rend l'application portable et facile à déployer.

## Démarrage Rapide

### Prérequis
- Node.js 18+
- Docker & Docker Compose

### Installation et Lancement
1. Clonez le dépôt.
2. Copiez le fichier d'environnement d'exemple : `cp .env.example .env` (et modifiez-le si nécessaire).
3. Lancez l'ensemble des services avec Docker Compose :
   ```bash
   docker-compose up -d
   ```
4. Initialisez la base de données (attendez quelques secondes que PostgreSQL démarre) :
   ```bash
   docker-compose exec backend npm run db:init
   ```
5. L'application est maintenant accessible :
   - Frontend : `http://localhost:3000`
   - Backend : `http://localhost:3001`

## Copyright

Copyright (c) 2024 kaoutarmaghraoui. Tous droits réservés.
