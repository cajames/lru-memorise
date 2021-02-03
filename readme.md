# LRU Memorise Fn

![Build](https://github.com/cajames/lru-memorise/workflows/Build%20and%20Test/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/cajames/lru-memorise/badge.svg?branch=master)](https://coveralls.io/github/cajames/lru-memorise?branch=master)

> A simple memorise function that uses a fast LRU cache under the hood.

## Basic features

- Works in Node and the browser
- Memorises both sync and async functions.
- Automatic cache key generation from function arguments
- Cache TTL / value expiry
- Fully typed: memorised functions inherit their source function types.
- Bring your own cache or cache-keygen function, or we create one for you.
- Cache is exposed for the memorised function, if you want to access it and modify or manually clear.

## Usage

```ts
import memorise from "lru-memorise";

const answerMyToughQuestion = (question: string) => {
  // ... heavy compute
  return response;
};

const memorisedFn = memorise(answerMyToughQuestion);

memorisedFn(`What's the meaning of life?`); // Calls source fn, response cached #1.
memorisedFn(`Are you an AI?`); // Calls source fn, response cached #2.

memorisedFn(`What's the meaning of life?`); // Returns cached value #1
memorisedFn(`Are you an AI?`); // Returns cached value #2
```

## Options

> Note, all options are optional

| Option           | Default         | Description                                                                                               |
| ---------------- | --------------- | --------------------------------------------------------------------------------------------------------- |
| cache            | `undefined`     | Bring your own LRU cache, as long as it supports standard `set` and `get` operations                      |
| cacheKeyResolver | defaultFn       | Function used to generate unique cache key from arguments. Takes array of arguments, and return a string. |
| lruOptions       | `{ max: 1000 }` | Default options for `tiny-lru`. The two options are `max` and `ttl`.                                      |

### Bring your own cache

Under the hood we use [`tiny-lru`](https://github.com/avoidwork/tiny-lru), but you can bring your own, or create your cache outside and use it.

If you don't provide one, we create a cache for you. This cache is exposed through the `_cache` function, if you want to have access to it.

### Bring your own cache key resolver

We have a simple function to generate a cache key from function arguments, using `JSON.stringify`. You can of course pass your own custom one if you have a more complex situation, or want to cache to behave differently. It should return a string.

```ts
type Resolver = (...args: any[]) => string;
```

### Tiny-LRU Options

By default, we limit the max cache size to 1000 keys, and we don't set a TTL on the key values.

```ts
Type LRUOPtions = {
  max: number // Max number of keys in Cache
  ttl: number // Expiry of items in cache
}
```
