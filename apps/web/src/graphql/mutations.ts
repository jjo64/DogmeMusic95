import { gql } from '@apollo/client';

export const ADD_HISTORY_ENTRY = gql`
  mutation AddHistoryEntry($artistId: ID!) {
    addHistoryEntry(artistId: $artistId)
  }
`;

export const CLEAR_HISTORY = gql`
  mutation ClearHistory {
    clearHistory
  }
`;

export const CREATE_LIST = gql`
  mutation CreateList($name: String!) {
    createList(name: $name) {
      id
      name
      artistIds
      createdAt
    }
  }
`;

export const DELETE_LIST = gql`
  mutation DeleteList($id: ID!) {
    deleteList(id: $id)
  }
`;

export const RENAME_LIST = gql`
  mutation RenameList($id: ID!, $name: String!) {
    renameList(id: $id, name: $name) {
      id
      name
      artistIds
      createdAt
    }
  }
`;

export const SAVE_ARTIST_TO_LIST = gql`
  mutation SaveArtistToList($artistId: ID!, $listId: ID!) {
    saveArtistToList(artistId: $artistId, listId: $listId) {
      id
      name
      artistIds
      createdAt
    }
  }
`;

export const REMOVE_ARTIST_FROM_LIST = gql`
  mutation RemoveArtistFromList($artistId: ID!, $listId: ID!) {
    removeArtistFromList(artistId: $artistId, listId: $listId) {
      id
      name
      artistIds
      createdAt
    }
  }
`;
