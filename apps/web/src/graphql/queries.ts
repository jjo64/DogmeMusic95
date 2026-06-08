import { gql } from '@apollo/client';

export const GET_ARTIST_GRAPH = gql`
  query GetArtistGraph($name: String!) {
    artistGraph(name: $name) {
      status
      jobId
      error
      graph {
        nodes {
          id
          label
          type
          description
        }
        links {
          source
          target
          type
          description
        }
        metadata {
          rootArtist
          generationTime
          description
        }
      }
    }
  }
`;

export const GET_MY_LISTS = gql`
  query GetMyLists {
    myLists {
      id
      name
      artistIds
      createdAt
    }
  }
`;

export const GET_EXPLORATION_HISTORY = gql`
  query GetExplorationHistory {
    explorationHistory {
      id
      artist {
        id
        name
        era
        origin
        genres
        description
        influenceScore
      }
      createdAt
    }
  }
`;

export const GET_COLLECTIONS = gql`
  query GetCollections {
    collections {
      id
      name
      subtitle
      description
      coverColor
      artistIds
      tags
    }
  }
`;

export const GET_TIMELINE_ARTISTS = gql`
  query GetTimelineArtists {
    timelineArtists {
      id
      name
      era
      origin
      genres
      description
      influenceScore
    }
  }
`;

export const DISCOVER_ARTISTS = gql`
  query DiscoverArtists(
    $darkness: Float!
    $energy: Float!
    $experimental: Float!
    $acousticness: Float!
    $danceability: Float!
  ) {
    discoverArtists(
      darkness: $darkness
      energy: $energy
      experimental: $experimental
      acousticness: $acousticness
      danceability: $danceability
    ) {
      id
      name
      era
      origin
      genres
      description
      influenceScore
      darkness
      energy
      experimental
      acousticness
      danceability
    }
  }
`;
