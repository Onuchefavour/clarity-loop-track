import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test activity logging and token rewards with valid parameters",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('loop-track', 'log-activity', [
        types.principal(user1.address),
        types.ascii("running"),
        types.uint(30),
        types.uint(300)
      ], user1.address)
    ]);
    
    block.receipts[0].result.expectOk();
    
    let response = chain.callReadOnlyFn(
      'loop-track',
      'get-token-balance',
      [types.principal(user1.address)],
      user1.address
    );
    response.result.expectOk().expectUint(300);
  }
});

Clarinet.test({
  name: "Test unauthorized activity logging",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('loop-track', 'log-activity', [
        types.principal(user1.address),
        types.ascii("running"),
        types.uint(30),
        types.uint(300)
      ], user2.address)
    ]);
    
    block.receipts[0].result.expectErr().expectUint(103); // err-unauthorized
  }
});

Clarinet.test({
  name: "Test invalid activity type",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('loop-track', 'log-activity', [
        types.principal(user1.address),
        types.ascii("invalid-activity"),
        types.uint(30),
        types.uint(300)
      ], user1.address)
    ]);
    
    block.receipts[0].result.expectErr().expectUint(101); // err-invalid-activity
  }
});

Clarinet.test({
  name: "Test invalid duration and calories",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user1 = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('loop-track', 'log-activity', [
        types.principal(user1.address),
        types.ascii("running"),
        types.uint(500),
        types.uint(20000)
      ], user1.address)
    ]);
    
    block.receipts[0].result.expectErr().expectUint(104); // err-invalid-params
  }
});
