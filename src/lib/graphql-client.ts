import { print, DocumentNode } from 'graphql';
import { 
  GetItemsDocument,
  GetItemDocument,
  GetTradersDocument,
  GetTraderDocument,
  GetTasksDocument,
  GetTaskDocument,
  GetItemsQuery,
  GetItemsQueryVariables,
  GetItemQuery,
  GetItemQueryVariables,
  GetTradersQuery,
  GetTradersQueryVariables,
  GetTraderQuery,
  GetTraderQueryVariables,
  GetTasksQuery,
  GetTasksQueryVariables,
  GetTaskQuery,
  GetTaskQueryVariables,
} from '@/graphql/generated';

// GraphQLエンドポイント
const GRAPHQL_ENDPOINT = 'https://api.tarkov.dev/graphql';

// 型安全なGraphQLクライアント
export class GraphQLClient {
  private endpoint: string;

  constructor(endpoint: string = GRAPHQL_ENDPOINT) {
    this.endpoint = endpoint;
  }

  // 汎用クエリ実行メソッド
  async request<TData, TVariables = Record<string, any>>(
    document: DocumentNode,
    variables?: TVariables
  ): Promise<TData> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: print(document),
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (result.errors && result.errors.length > 0) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  }

  // アイテム一覧取得
  async getItems(variables: GetItemsQueryVariables): Promise<GetItemsQuery> {
    return this.request<GetItemsQuery, GetItemsQueryVariables>(
      GetItemsDocument,
      variables
    );
  }

  // アイテム詳細取得
  async getItem(variables: GetItemQueryVariables): Promise<GetItemQuery> {
    return this.request<GetItemQuery, GetItemQueryVariables>(
      GetItemDocument,
      variables
    );
  }

  // トレーダー一覧取得
  async getTraders(variables: GetTradersQueryVariables): Promise<GetTradersQuery> {
    return this.request<GetTradersQuery, GetTradersQueryVariables>(
      GetTradersDocument,
      variables
    );
  }

  // トレーダー詳細取得
  async getTrader(variables: GetTraderQueryVariables): Promise<GetTraderQuery> {
    return this.request<GetTraderQuery, GetTraderQueryVariables>(
      GetTraderDocument,
      variables
    );
  }

  // タスク一覧取得
  async getTasks(variables: GetTasksQueryVariables): Promise<GetTasksQuery> {
    return this.request<GetTasksQuery, GetTasksQueryVariables>(
      GetTasksDocument,
      variables
    );
  }

  // タスク詳細取得
  async getTask(variables: GetTaskQueryVariables): Promise<GetTaskQuery> {
    return this.request<GetTaskQuery, GetTaskQueryVariables>(
      GetTaskDocument,
      variables
    );
  }
}

// デフォルトクライアントインスタンス
export const graphqlClient = new GraphQLClient();

// ヘルパー関数
export async function fetchItems(language: string = 'ja') {
  return graphqlClient.getItems({ lang: language });
}

export async function fetchItem(id: string, language: string = 'ja') {
  return graphqlClient.getItem({ id, lang: language });
}

export async function fetchTraders(language: string = 'ja') {
  return graphqlClient.getTraders({ lang: language });
}

export async function fetchTrader(id: string, language: string = 'ja') {
  return graphqlClient.getTrader({ id, lang: language });
}

export async function fetchTasks(language: string = 'ja') {
  return graphqlClient.getTasks({ lang: language });
}

export async function fetchTask(id: string, language: string = 'ja') {
  return graphqlClient.getTask({ id, lang: language });
}


