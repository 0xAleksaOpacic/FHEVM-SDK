# Roadmap

This document covers major features and improvements we plan to add to the FHEVM SDK Template. For smaller day-to-day tasks and bug tracking, please visit our [GitHub Issues](https://github.com/0xAleksaOpacic/FHEVM-SDK/issues).

If you have a feature to add, please create an issue on GitHub and add the `feature request` tag.

## Features

| Name | Description | Status |
|------|-------------|--------|
| Viem Support | Add viem as alternative to ethers for contract interactions. Currently requires ethers even though wagmi uses viem, creating unnecessary bundle duplication. | Planned |
| Multi-Wallet Support | Fix flaky behavior when multiple wallet extensions are installed. Currently may connect with one wallet but send transactions with another. | Planned |
| Extended Example Coverage | Add examples demonstrating request batching, different cache storage options, and advanced patterns | Planned |
| CLI Scaffolding Tool | Create `npx create-fhevm-app` tool to quickly scaffold new FHEVM projects with framework selection (Next.js, Vue, or vanilla) | Planned |

