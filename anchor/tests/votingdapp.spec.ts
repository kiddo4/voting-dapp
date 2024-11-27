import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'

import { Votingdapp } from '../target/types/votingdapp'


const IDL = require('../target/idl/votingdapp.json')

const votingAddress = new PublicKey("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

describe('votingdapp', () => {
  let context;
  let provider;
  let votingProgram: anchor.Program<Votingdapp>;

  beforeAll(async () => {
     context = await startAnchor("", [{ name: "votingdapp", programId: votingAddress }], []);
    provider = new BankrunProvider(context);

    votingProgram = new Program<Votingdapp>(
      IDL,
      provider,
    );
  });
  
  it('Initialize poll', async () => {
    
    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        "What is your fav peanut butter?",
        new anchor.BN(0),
        new anchor.BN(1731599645),
      )
      .rpc();

      const [pollAddress]  = PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
        votingAddress,
      )

      const poll = await votingProgram.account.poll.fetch(pollAddress);

      console.log(poll);

      expect(poll.pollId.toNumber()).toEqual(1);
      expect(poll.description).toEqual("What is your fav peanut butter?");
      expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());

  });
  it('initialize candidate', async () => {
    await votingProgram.methods
      .initializeCandidate(
        "Smooth",
        new anchor.BN(1),
      )
      .rpc();
  });

  it('initialize candidate', async () => {
    await votingProgram.methods
      .initializeCandidate(
        "Crunchy",
        new anchor.BN(1),
      )
      .rpc();
      const [crunchyAddress] = PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Crunchy")],
        votingAddress,
      );

      const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress);
      console.log(crunchyCandidate);
      expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(0);

      const [smoothAddress] = PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Smooth")],
        votingAddress,
      );

      const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress);
      console.log(smoothCandidate);
  });


  it('vote', async () => {
    
  });
});
