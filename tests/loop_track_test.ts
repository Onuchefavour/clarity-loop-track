import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test activity logging and token rewards",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user1 = accounts.get('wallet_1')!;
    
    // Log activity
    let block = chain.mineBlock([
      Tx.contractCall('loop-track', 'log-activity', [
        types.principal(user1.address),
        types.ascii("running"),
        types.uint(30),
        types.uint(300)
      ], user1.address)
    ]);
    
    block.receipts[0].result.expectOk();
    
    // Check token balance (should be 30 * 10 = 300 tokens)
    let response = chain.callReadOnlyFn(
      'loop-track',
      'get-token-balance',
      [types.principal(user1.address)],
      user1.address
    );
    response.result.expectOk().expectUint(300);
    
    // Check activity stats
    response = chain.callReadOnlyFn(
      'loop-track',
      'get-activity-stats',
      [types.principal(user1.address)],
      user1.address
    );
    let stats = response.result.expectOk().expectTuple();
    assertEquals(stats['total-activities'], types.uint(1));
    assertEquals(stats['total-minutes'], types.uint(30));
    assertEquals(stats['total-calories'], types.uint(300));
  }
});

Clarinet.test({
  name: "Test token redemption",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user1 = accounts.get('wallet_1')!;
    
    // First log activity to get tokens
    let block = chain.mineBlock([
      Tx.contractCall('loop-track', 'log-activity', [
        types.principal(user1.address),
        types.ascii("running"),
        types.uint(30),
        types.uint(300)
      ], user1.address)
    ]);
    
    // Try to redeem tokens
    block = chain.mineBlock([
      Tx.contractCall('loop-track', 'redeem-tokens', [
        types.uint(100),
        types.principal(user1.address)
      ], user1.address)
    ]);
    
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Check remaining balance
    let response = chain.callReadOnlyFn(
      'loop-track',
      'get-token-balance',
      [types.principal(user1.address)],
      user1.address
    );
    response.result.expectOk().expectUint(200);
  }
});

Clarinet.test({
  name: "Test insufficient tokens for redemption",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user1 = accounts.get('wallet_1')!;
    
    // Try to redeem tokens without any balance
    let block = chain.mineBlock([
      Tx.contractCall('loop-track', 'redeem-tokens', [
        types.uint(100),
        types.principal(user1.address)
      ], user1.address)
    ]);
    
    block.receipts[0].result.expectErr().expectUint(102); // err-insufficient-tokens
  }
});
