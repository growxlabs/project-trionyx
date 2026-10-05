/** Isolated fixture measurements; never an SLA or live model benchmark. */
import {randomUUID} from 'node:crypto';
import {MockLanguageModelV3} from 'ai/test';
import {createGoldenFixture} from '../packages/ai/src/evals/fixture-v1';
import {runTrix} from '../packages/ai/src/trix-agent';
import {latencyPercentiles} from '../packages/ai/src/logging/metrics';
async function main(){
  const requests:number[]=[],tools:number[]=[],models:number[]=[],database:number[]=[],confirmations:number[]=[];
  for(let index=0;index<20;index++){
    const fixture=await createGoldenFixture();try{
      let started=performance.now();await fixture.db.execute('SELECT COUNT(*) FROM serial_numbers');database.push(performance.now()-started);
      const model=new MockLanguageModelV3({doGenerate:{content:[{type:'tool-call',toolCallId:randomUUID(),toolName:'lookupSerial',input:JSON.stringify({serialNumber:'TRX-001'})}],finishReason:{unified:'tool-calls',raw:undefined},usage:{inputTokens:{total:10,noCache:10,cacheRead:undefined,cacheWrite:undefined},outputTokens:{total:20,text:20,reasoning:undefined}},warnings:[]}});
      started=performance.now();const execution=await runTrix({conversationId:randomUUID(),message:'Find serial TRX-001'},fixture.context,{...fixture.dependencies,model});requests.push(performance.now()-started);tools.push(execution.activity[0].durationMs);
      const log=await fixture.db.execute({sql:'SELECT metrics FROM agent_execution_logs WHERE id=?',args:[execution.requestId]});models.push(JSON.parse(String(log.rows[0].metrics)).modelDurationMs);
      const action=await fixture.service.prepare('ENQUIRY_STATUS_CHANGE',{enquiryReference:{code:'ENQ-1'},proposedStatus:'IN_PROGRESS'},fixture.context);
      started=performance.now();const confirmed=await fixture.service.confirm({preparationId:action.preparationId,confirm:true,previewDigest:action.previewDigest},fixture.context);if(confirmed.state!=='EXECUTED')throw new Error('FIXTURE_CONFIRMATION_FAILED');confirmations.push(performance.now()-started);
    }finally{fixture.db.close();}
  }
  console.log(JSON.stringify({scope:'20 isolated SQLite fixtures; mock model, real repositories/services; confirmation includes transaction commit; no live business mutation',request:latencyPercentiles(requests),tool:latencyPercentiles(tools),mockModel:latencyPercentiles(models),sqliteQuery:latencyPercentiles(database),confirmation:latencyPercentiles(confirmations)},null,2));
}
main().catch(()=>{console.error('FIXTURE_BENCHMARK_FAILED (details suppressed)');process.exitCode=1;});
