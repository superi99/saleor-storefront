import { ApolloQueryResult, OperationVariables } from "apollo-client";
import { DocumentNode } from "graphql";
import gql from "graphql-tag";
import { QueryHookOptions, QueryResult, useQuery } from "react-apollo";

import { attributeFragment, featuredProductsFragment } from "./fragments";

type LoadMore<TData> = (
  mergeFn: (prev: TData, next: TData) => TData,
  endCursor: string
) => Promise<ApolloQueryResult<TData>>;

export const useTypedQuery = <TData = any, TVariables = OperationVariables>(
  query: DocumentNode,
  options?: QueryHookOptions<TData, TVariables>
): QueryResult<TData, TVariables> & {
  loadMore: LoadMore<TData>;
} => {
  const queryResult = useQuery<TData, TVariables>(query, options);

  const loadMore: LoadMore<TData> = (mergeFn, endCursor) =>
    queryResult.fetchMore({
      query,
      updateQuery: (previousResults, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return previousResults;
        }
        return mergeFn(previousResults, fetchMoreResult);
      },
      variables: { ...options?.variables, endCursor },
    });

  return { loadMore, ...queryResult };
};

export const featuredProductsQuery = gql`
  ${featuredProductsFragment}
  query FeaturedProductsQuery($channel: String!) {
    ...FeaturedProducts
  }
`;

export const shopAttributesQuery = gql`
  ${attributeFragment}
  query ShopAttributesQuery(
    $channel: String!
    $collectionId: ID
    $categoryId: ID
  ) {
    attributes(
      filter: {
        channel: $channel
        inCollection: $collectionId
        inCategory: $categoryId
        filterableInStorefront: true
      }
      first: 100
    ) {
      edges {
        node {
          ...Attribute
        }
      }
    }
  }
`;