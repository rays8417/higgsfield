#!/usr/bin/env ts-node

import { PrismaClient, TournamentStatus } from '@prisma/client';
import { Command } from 'commander';

const prisma = new PrismaClient();

interface TournamentData {
  name: string;
  description?: string;
  matchDate: Date;
  team1: string;
  team2: string;
  venue?: string;
  status: TournamentStatus;
  entryFee: number;
  maxParticipants?: number;
}

interface PlayerScoreData {
  moduleName: string;
  runs: number;
  ballsFaced: number;
  wickets: number;
  oversBowled: number;
  runsConceded: number;
  catches: number;
  stumpings: number;
  runOuts: number;
}

interface ScoresUpdateData {
  tournamentId: string;
  playerScores: PlayerScoreData[];
}

// Sample tournament data
const sampleTournaments: TournamentData[] = [
    {
        "name": "India vs England - T20 World Cup",
        "description": "Semi-final match between India and Australia",
        "matchDate": new Date("2024-03-15T19:00:00Z"),
        "team1": "India",
        "team2": "Australia", 
        "venue": "Melbourne Cricket Ground",
        "entryFee": 0,
        "status": TournamentStatus.ONGOING

      }
];

// Sample player scores data - Uses the exact data provided by user
const sampleScoresData: ScoresUpdateData = {
  tournamentId: "056540e8-4706-45a9-a585-855367839599", // Original tournament ID from user's data
  playerScores: [
    {
      moduleName: "AbhishekSharma",
      runs: 85,
      ballsFaced: 65,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      catches: 2,
      stumpings: 0,
      runOuts: 1
    },
    {
      moduleName: "ViratKohli",
      runs: 42,
      ballsFaced: 38,
      wickets: 3,
      oversBowled: 4,
      runsConceded: 28,
      catches: 1,
      stumpings: 0,
      runOuts: 0
    },
    {
      moduleName: "RohitSharma",
      runs: 120,
      ballsFaced: 95,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      catches: 0,
      stumpings: 0,
      runOuts: 0
    },
    {
      moduleName: "MSDhoni",
      runs: 15,
      ballsFaced: 12,
      wickets: 2,
      oversBowled: 3,
      runsConceded: 22,
      catches: 0,
      stumpings: 1,
      runOuts: 0
    },
    {
      moduleName: "HardikPandya",
      runs: 35,
      ballsFaced: 28,
      wickets: 1,
      oversBowled: 2,
      runsConceded: 15,
      catches: 1,
      stumpings: 0,
      runOuts: 0
    }
  ]
};

async function createTournament(tournamentData: TournamentData) {
  try {
    console.log(`Creating tournament: ${tournamentData.name}`);
    
    const tournament = await prisma.tournament.create({
      data: {
        name: tournamentData.name,
        description: tournamentData.description,
        matchDate: tournamentData.matchDate,
        team1: tournamentData.team1,
        team2: tournamentData.team2,
        venue: tournamentData.venue,
        status: tournamentData.status,
        entryFee: tournamentData.entryFee,
        maxParticipants: tournamentData.maxParticipants,
        currentParticipants: 0
      }
    });

    console.log(`✅ Tournament created successfully!`);
    console.log(`   ID: ${tournament.id}`);
    console.log(`   Name: ${tournament.name}`);
    console.log(`   Status: ${tournament.status}`);
    console.log(`   Teams: ${tournament.team1} vs ${tournament.team2}`);
    console.log(`   Match Date: ${tournament.matchDate.toISOString()}`);
    console.log(`   Entry Fee: ${tournament.entryFee} APT`);
    console.log(`   Max Participants: ${tournament.maxParticipants || 'Unlimited'}`);
    console.log('');

    return tournament;
  } catch (error) {
    console.error(`❌ Error creating tournament: ${tournamentData.name}`);
    console.error(error);
    throw error;
  }
}

async function createCustomTournament() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, resolve);
    });
  };

  try {
    console.log('\n🏏 Creating Custom Tournament');
    console.log('============================\n');

    const name = await question('Tournament Name: ');
    const description = await question('Description (optional): ');
    const team1 = await question('Team 1: ');
    const team2 = await question('Team 2: ');
    const venue = await question('Venue (optional): ');
    const entryFeeStr = await question('Entry Fee (APT): ');
    const maxParticipantsStr = await question('Max Participants (optional): ');
    const matchDateStr = await question('Match Date (YYYY-MM-DD HH:MM): ');

    const entryFee = parseFloat(entryFeeStr) || 0;
    const maxParticipants = maxParticipantsStr ? parseInt(maxParticipantsStr) : undefined;
    const matchDate = new Date(matchDateStr);

    if (isNaN(matchDate.getTime())) {
      throw new Error('Invalid date format');
    }

    const tournamentData: TournamentData = {
      name,
      description: description || undefined,
      matchDate,
      team1,
      team2,
      venue: venue || undefined,
      status: TournamentStatus.ONGOING,
      entryFee,
      maxParticipants
    };

    await createTournament(tournamentData);
  } catch (error) {
    console.error('❌ Error in custom tournament creation:', error);
  } finally {
    rl.close();
  }
}

async function createSampleTournaments() {
  console.log('\n🏏 Creating Sample Tournaments');
  console.log('==============================\n');

  for (const tournamentData of sampleTournaments) {
    await createTournament(tournamentData);
  }

  console.log(`✅ Created ${sampleTournaments.length} sample tournaments!`);
}

async function listTournaments() {
  try {
    console.log('\n📋 Current Tournaments');
    console.log('======================\n');

    const tournaments = await prisma.tournament.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (tournaments.length === 0) {
      console.log('No tournaments found.');
      return;
    }

    tournaments.forEach((tournament, index) => {
      console.log(`${index + 1}. ${tournament.name}`);
      console.log(`   ID: ${tournament.id}`);
      console.log(`   Status: ${tournament.status}`);
      console.log(`   Teams: ${tournament.team1} vs ${tournament.team2}`);
      console.log(`   Date: ${tournament.matchDate.toISOString()}`);
      console.log(`   Entry Fee: ${tournament.entryFee} APT`);
      console.log(`   Participants: ${tournament.currentParticipants}/${tournament.maxParticipants || '∞'}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error listing tournaments:', error);
  }
}

async function updateTournamentStatus(tournamentId: string, status: TournamentStatus) {
  try {
    const tournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status }
    });

    console.log(`✅ Tournament status updated to ${status}`);
    console.log(`   Tournament: ${tournament.name}`);
    console.log(`   New Status: ${tournament.status}`);
  } catch (error) {
    console.error('❌ Error updating tournament status:', error);
  }
}

async function endTournament(tournamentId: string) {
  try {
    console.log(`🏁 Ending tournament: ${tournamentId}`);
    
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { id: true, name: true, status: true }
    });

    if (!tournament) {
      console.error(`❌ Tournament with ID ${tournamentId} not found`);
      return;
    }

    if (tournament.status === TournamentStatus.COMPLETED) {
      console.log(`ℹ️  Tournament "${tournament.name}" is already completed`);
      return;
    }

    const updatedTournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: TournamentStatus.COMPLETED }
    });

    console.log(`✅ Tournament ended successfully!`);
    console.log(`   Tournament: ${updatedTournament.name}`);
    console.log(`   Status: ${updatedTournament.status}`);
    console.log(`   Ended at: ${new Date().toISOString()}`);
  } catch (error) {
    console.error('❌ Error ending tournament:', error);
    throw error;
  }
}

async function endAllOngoingTournaments() {
  try {
    console.log('\n🏁 Ending All Ongoing Tournaments');
    console.log('==================================\n');

    // Find all ongoing tournaments
    const ongoingTournaments = await prisma.tournament.findMany({
      where: { status: TournamentStatus.ONGOING },
      select: { id: true, name: true, status: true }
    });

    if (ongoingTournaments.length === 0) {
      console.log('No ongoing tournaments found.');
      return;
    }

    console.log(`Found ${ongoingTournaments.length} ongoing tournaments:`);
    ongoingTournaments.forEach((tournament, index) => {
      console.log(`${index + 1}. ${tournament.name} (ID: ${tournament.id})`);
    });
    console.log('');

    // End all ongoing tournaments
    for (const tournament of ongoingTournaments) {
      await endTournament(tournament.id);
    }

    console.log(`\n🎉 Successfully ended ${ongoingTournaments.length} tournaments!`);
  } catch (error) {
    console.error('❌ Error ending all ongoing tournaments:', error);
    throw error;
  }
}

async function cleanupTournaments(keepTournamentId?: string) {
  try {
    console.log('\n🧹 Cleaning up tournaments...');
    console.log('============================\n');

    // Get all tournaments
    const allTournaments = await prisma.tournament.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (allTournaments.length === 0) {
      console.log('No tournaments found to clean up.');
      return;
    }

    console.log(`Found ${allTournaments.length} tournaments:`);
    allTournaments.forEach((tournament, index) => {
      console.log(`${index + 1}. ${tournament.name} (${tournament.status}) - ID: ${tournament.id}`);
    });

    let tournamentToKeep: any;
    
    if (keepTournamentId) {
      tournamentToKeep = allTournaments.find(t => t.id === keepTournamentId);
      if (!tournamentToKeep) {
        console.error(`❌ Tournament with ID ${keepTournamentId} not found`);
        return;
      }
    } else {
      // Keep the most recent tournament
      tournamentToKeep = allTournaments[0];
    }

    console.log(`\n📌 Keeping tournament: ${tournamentToKeep.name}`);
    console.log(`   ID: ${tournamentToKeep.id}`);
    console.log(`   Status: ${tournamentToKeep.status}`);

    // Delete all other tournaments
    const tournamentsToDelete = allTournaments.filter(t => t.id !== tournamentToKeep.id);
    
    if (tournamentsToDelete.length === 0) {
      console.log('No tournaments to delete.');
      return;
    }

    console.log(`\n🗑️  Deleting ${tournamentsToDelete.length} tournaments:`);
    
    for (const tournament of tournamentsToDelete) {
      console.log(`   Deleting: ${tournament.name} (${tournament.id})`);
      
      // Delete related data first (due to foreign key constraints)
    

      await prisma.playerScore.deleteMany({
        where: { tournamentId: tournament.id }
      });

      await prisma.rewardPool.deleteMany({
        where: { tournamentId: tournament.id }
      });

      // Finally delete the tournament
      await prisma.tournament.delete({
        where: { id: tournament.id }
      });

      console.log(`   ✅ Deleted: ${tournament.name}`);
    }

    console.log(`\n🎉 Cleanup completed!`);
    console.log(`   Kept: ${tournamentToKeep.name}`);
    console.log(`   Deleted: ${tournamentsToDelete.length} tournaments`);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

async function endAndCleanupTournaments(keepTournamentId?: string) {
  try {
    console.log('\n🏁 Ending and Cleaning Up Tournaments');
    console.log('=====================================\n');

    // First, end all ongoing tournaments
    const ongoingTournaments = await prisma.tournament.findMany({
      where: { status: TournamentStatus.ONGOING }
    });

    if (ongoingTournaments.length > 0) {
      console.log(`Found ${ongoingTournaments.length} ongoing tournaments. Ending them...`);
      
      for (const tournament of ongoingTournaments) {
        await endTournament(tournament.id);
      }
    } else {
      console.log('No ongoing tournaments found.');
    }

    // Then cleanup, keeping only one tournament
    await cleanupTournaments(keepTournamentId);
  } catch (error) {
    console.error('❌ Error during end and cleanup:', error);
    throw error;
  }
}

function calculateFantasyPoints(playerScore: PlayerScoreData): number {
  let points = 0;
  
  // Batting points
  points += playerScore.runs; // 1 point per run
  
  // Bonus points for batting
  if (playerScore.runs >= 50) points += 8; // Half century bonus
  if (playerScore.runs >= 100) points += 16; // Century bonus
  
  // Strike rate bonus (if balls faced > 0)
  if (playerScore.ballsFaced > 0) {
    const strikeRate = (playerScore.runs / playerScore.ballsFaced) * 100;
    if (strikeRate >= 200) points += 6; // 200+ strike rate bonus
    else if (strikeRate >= 150) points += 4; // 150+ strike rate bonus
  }
  
  // Bowling points
  points += playerScore.wickets * 25; // 25 points per wicket
  
  // Bonus points for bowling
  if (playerScore.wickets >= 3) points += 8; // 3+ wickets bonus
  if (playerScore.wickets >= 5) points += 16; // 5+ wickets bonus
  
  // Economy rate bonus (if overs bowled > 0)
  if (playerScore.oversBowled > 0) {
    const economyRate = playerScore.runsConceded / playerScore.oversBowled;
    if (economyRate <= 4) points += 6; // Excellent economy bonus
    else if (economyRate <= 6) points += 4; // Good economy bonus
  }
  
  // Fielding points
  points += playerScore.catches * 8; // 8 points per catch
  points += playerScore.stumpings * 12; // 12 points per stumping
  points += playerScore.runOuts * 12; // 12 points per run out
  
  return Math.round(points * 100) / 100; // Round to 2 decimal places
}

async function updatePlayerScores(scoresData: ScoresUpdateData) {
  try {
    console.log(`\n📊 Updating Player Scores`);
    console.log(`========================\n`);
    console.log(`Tournament ID: ${scoresData.tournamentId}`);
    console.log(`Players: ${scoresData.playerScores.length}\n`);

    // Verify tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: scoresData.tournamentId },
      select: { id: true, name: true, status: true }
    });

    if (!tournament) {
      throw new Error(`Tournament with ID ${scoresData.tournamentId} not found`);
    }

    console.log(`Tournament: ${tournament.name}`);
    console.log(`Status: ${tournament.status}\n`);

    // Update or create player scores
    for (const playerScore of scoresData.playerScores) {
      const fantasyPoints = calculateFantasyPoints(playerScore);
      
      console.log(`Updating ${playerScore.moduleName}:`);
      console.log(`  Runs: ${playerScore.runs} (${playerScore.ballsFaced} balls)`);
      console.log(`  Wickets: ${playerScore.wickets} (${playerScore.oversBowled} overs, ${playerScore.runsConceded} runs)`);
      console.log(`  Fielding: ${playerScore.catches} catches, ${playerScore.stumpings} stumpings, ${playerScore.runOuts} run outs`);
      console.log(`  Fantasy Points: ${fantasyPoints}\n`);

      await prisma.playerScore.upsert({
        where: {
          tournamentId_moduleName: {
            tournamentId: scoresData.tournamentId,
            moduleName: playerScore.moduleName
          }
        },
        update: {
          runs: playerScore.runs,
          ballsFaced: playerScore.ballsFaced,
          wickets: playerScore.wickets,
          oversBowled: playerScore.oversBowled,
          runsConceded: playerScore.runsConceded,
          catches: playerScore.catches,
          stumpings: playerScore.stumpings,
          runOuts: playerScore.runOuts,
          fantasyPoints: fantasyPoints
        },
        create: {
          tournamentId: scoresData.tournamentId,
          moduleName: playerScore.moduleName,
          runs: playerScore.runs,
          ballsFaced: playerScore.ballsFaced,
          wickets: playerScore.wickets,
          oversBowled: playerScore.oversBowled,
          runsConceded: playerScore.runsConceded,
          catches: playerScore.catches,
          stumpings: playerScore.stumpings,
          runOuts: playerScore.runOuts,
          fantasyPoints: fantasyPoints
        }
      });
    }

    console.log(`✅ Successfully updated scores for ${scoresData.playerScores.length} players!`);
    
    // Show summary
    const totalPoints = scoresData.playerScores.reduce((sum, player) => sum + calculateFantasyPoints(player), 0);
    console.log(`📈 Total Fantasy Points: ${totalPoints.toFixed(2)}`);
    
    const topPerformer = scoresData.playerScores.reduce((top, player) => 
      calculateFantasyPoints(player) > calculateFantasyPoints(top) ? player : top
    );
    console.log(`🏆 Top Performer: ${topPerformer.moduleName} (${calculateFantasyPoints(topPerformer)} points)`);

  } catch (error) {
    console.error('❌ Error updating player scores:', error);
    throw error;
  }
}

async function updateScoresFromFile(filePath: string) {
  try {
    const fs = require('fs');
    const path = require('path');
    
    console.log(`📁 Reading scores from file: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const scoresData: ScoresUpdateData = JSON.parse(fileContent);
    
    await updatePlayerScores(scoresData);
  } catch (error) {
    console.error('❌ Error updating scores from file:', error);
    throw error;
  }
}

async function updateSampleScores(tournamentId?: string) {
  try {
    console.log('\n📊 Updating Sample Player Scores');
    console.log('=================================\n');
    
    // Use provided tournament ID or default sample data
    const scoresData = tournamentId 
      ? { ...sampleScoresData, tournamentId }
      : sampleScoresData;
    
    await updatePlayerScores(scoresData);
  } catch (error) {
    console.error('❌ Error updating sample scores:', error);
    throw error;
  }
}

async function main() {
  const program = new Command();

  program
    .name('tournament-script')
    .description('Tournament management script for cricket fantasy sports')
    .version('1.0.0');

  program
    .command('create-sample')
    .description('Create sample tournaments with ongoing status')
    .action(async () => {
      try {
        await createSampleTournaments();
      } catch (error) {
        console.error('Failed to create sample tournaments:', error);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    });

  program
    .command('create-custom')
    .description('Create a custom tournament with ongoing status')
    .action(async () => {
      try {
        await createCustomTournament();
      } catch (error) {
        console.error('Failed to create custom tournament:', error);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    });

  program
    .command('list')
    .description('List all tournaments')
    .action(async () => {
      try {
        await listTournaments();
      } catch (error) {
        console.error('Failed to list tournaments:', error);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    });

  program
    .command('update-status')
    .description('Update tournament status')
    .argument('<tournament-id>', 'Tournament ID')
    .argument('<status>', 'New status (UPCOMING, ONGOING, COMPLETED, CANCELLED)')
    .action(async (tournamentId: string, status: string) => {
      try {
        const validStatuses = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status.toUpperCase())) {
          console.error(`❌ Invalid status. Must be one of: ${validStatuses.join(', ')}`);
          process.exit(1);
        }
        
        await updateTournamentStatus(tournamentId, status.toUpperCase() as TournamentStatus);
      } catch (error) {
        console.error('Failed to update tournament status:', error);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    });

  program
    .command('end')
    .description('End a tournament by setting status to COMPLETED')
    .argument('<tournament-id>', 'Tournament ID to end')
    .action(async (tournamentId: string) => {
      try {
        await endTournament(tournamentId);
      } catch (error) {
        console.error('Failed to end tournament:', error);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    });

  program
    .command('end-all-ongoing')
    .description('End all ongoing tournaments by setting status to COMPLETED')
    .action(async () => {
      try {
        await endAllOngoingTournaments();
      } catch (error) {
        console.error('Failed to end all ongoing tournaments:', error);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    });

  program
    .command('cleanup')
    .description('Keep only one tournament and delete all others')
    .option('-k, --keep <tournament-id>', 'Tournament ID to keep (defaults to most recent)')
    .action(async (options) => {
      try {
        await cleanupTournaments(options.keep);
      } catch (error) {
        console.error('Failed to cleanup tournaments:', error);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    });

  program
    .command('end-and-cleanup')
    .description('End all ongoing tournaments and keep only one tournament')
    .option('-k, --keep <tournament-id>', 'Tournament ID to keep (defaults to most recent)')
    .action(async (options) => {
      try {
        await endAndCleanupTournaments(options.keep);
      } catch (error) {
        console.error('Failed to end and cleanup tournaments:', error);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    });

  program
    .command('update-scores')
    .description('Update player scores for a tournament')
    .argument('<tournament-id>', 'Tournament ID')
    .argument('<scores-json>', 'JSON string with player scores data')
    .action(async (tournamentId: string, scoresJson: string) => {
      try {
        const scoresData: ScoresUpdateData = JSON.parse(scoresJson);
        scoresData.tournamentId = tournamentId;
        await updatePlayerScores(scoresData);
      } catch (error) {
        console.error('Failed to update scores:', error);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    });

  program
    .command('update-scores-file')
    .description('Update player scores from a JSON file')
    .argument('<file-path>', 'Path to JSON file containing scores data')
    .action(async (filePath: string) => {
      try {
        await updateScoresFromFile(filePath);
      } catch (error) {
        console.error('Failed to update scores from file:', error);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    });

  program
    .command('update-sample-scores')
    .description('Update sample player scores for testing')
    .argument('[tournament-id]', 'Tournament ID to update scores for (optional)')
    .action(async (tournamentId?: string) => {
      try {
        await updateSampleScores(tournamentId);
      } catch (error) {
        console.error('Failed to update sample scores:', error);
        process.exit(1);
      } finally {
        await prisma.$disconnect();
      }
    });

  // If no command is provided, show help
  if (process.argv.length <= 2) {
    program.help();
  }

  await program.parseAsync(process.argv);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { 
  createTournament, 
  createSampleTournaments, 
  listTournaments, 
  updateTournamentStatus,
  endTournament,
  endAllOngoingTournaments,
  cleanupTournaments,
  endAndCleanupTournaments,
  updatePlayerScores,
  updateScoresFromFile,
  updateSampleScores,
  calculateFantasyPoints
};
