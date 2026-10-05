import {z} from 'zod';
import {TRIX_TOOL_NAMES} from '../tool-selection';
const allowedEvents=new Set<string>([...TRIX_TOOL_NAMES,'unsupported','prepareAction','confirmPreparedAction','cancelPreparedAction','expirePreparedAction']);
const number=z.number().finite().nonnegative();
export const safeMetricsSchema=z.object({requestDurationMs:number,modelDurationMs:number,inputTokens:number.int().nullable(),outputTokens:number.int().nullable(),estimatedCostUsd:number.nullable(),providerCostCredits:number.nullable().optional()}).strict();
export function latencyPercentiles(samples:number[]) {
  const sorted=samples.filter(value=>Number.isFinite(value)&&value>=0).sort((a,b)=>a-b);
  const at=(p:number)=>sorted.length?sorted[Math.max(0,Math.ceil(sorted.length*p)-1)]:null;
  return {samples:sorted.length,p50Ms:at(.5),p95Ms:at(.95)};
}
/** Metrics consume a projection, never user identifiers or business payloads. */
export function aggregateTrixMetrics(rows:Array<{request_summary:unknown;response_type:unknown;error_code:unknown;model_provider:unknown;model_name:unknown;tool_events:unknown;metrics:unknown}>) {
  const latency:number[]=[],modelLatency:number[]=[],toolLatency:number[]=[],confirmationLatency:number[]=[];
  const toolUsage:Record<string,number>={},errors:Record<string,number>={},models:Record<string,number>={};
  let requests=0,successes=0,failures=0,confirmationRequired=0,actionSuccess=0,actionFailure=0,inputTokens=0,outputTokens=0,cost=0,usageSamples=0,costSamples=0,creditCost=0,creditSamples=0;
  for(const row of rows){
    const isRequest=row.request_summary==='trix_read_request';
    if(isRequest){requests++;if(row.response_type==='pending'||row.error_code)failures++;else successes++;}
    const error=typeof row.error_code==='string'&&/^[A-Z_]{1,100}$/.test(row.error_code)?row.error_code:null;if(error)errors[error]=(errors[error]??0)+1;
    const model=`${row.model_provider}/${row.model_name}`;if(/^[A-Za-z0-9/_.:-]{1,200}$/.test(model))models[model]=(models[model]??0)+1;
    let events:unknown=[];try{events=JSON.parse(String(row.tool_events));}catch{/* damaged metadata contributes no payload */}
    if(Array.isArray(events))for(const raw of events){
      const event=z.object({toolName:z.string().regex(/^[A-Za-z]{1,80}$/),toolStatus:z.enum(['started','succeeded','failed']),toolDurationMs:number,resultSummary:z.string().max(500)}).passthrough().safeParse(raw);
      if(!event.success||!allowedEvents.has(event.data.toolName))continue;const e=event.data;
      if(e.toolStatus!=='started'){toolUsage[e.toolName]=(toolUsage[e.toolName]??0)+1;if(isRequest)toolLatency.push(e.toolDurationMs);}
      if(row.request_summary==='trix_action_lifecycle'&&e.toolStatus==='succeeded'&&e.toolName==='prepareAction')confirmationRequired++;
      if(e.toolName==='confirmPreparedAction'){confirmationLatency.push(e.toolDurationMs);if(e.toolStatus==='succeeded'&&/state=EXECUTED(?:;|$)/.test(e.resultSummary))actionSuccess++;else if(e.toolStatus==='failed')actionFailure++;}
    }
    let metadata:unknown=null;try{metadata=JSON.parse(String(row.metrics));}catch{/* absent before migration */}
    const parsed=safeMetricsSchema.safeParse(metadata);if(parsed.success){const m=parsed.data;if(isRequest){latency.push(m.requestDurationMs);modelLatency.push(m.modelDurationMs);}if(m.inputTokens!==null&&m.outputTokens!==null){inputTokens+=m.inputTokens;outputTokens+=m.outputTokens;usageSamples++;}if(m.estimatedCostUsd!==null){cost+=m.estimatedCostUsd;costSamples++;}if(m.providerCostCredits!==undefined&&m.providerCostCredits!==null){creditCost+=m.providerCostCredits;creditSamples++;}}
  }
  return {requests,successes,failures,successRate:requests?successes/requests:null,toolUsage,errors,models,confirmationRequired,actionSuccess,actionFailure,latency:latencyPercentiles(latency),modelLatency:latencyPercentiles(modelLatency),toolLatency:latencyPercentiles(toolLatency),confirmationLatency:latencyPercentiles(confirmationLatency),inputTokens,outputTokens,usageSamples,estimatedCostUsd:costSamples?cost:null,costSamples,providerCostCredits:creditSamples?creditCost:null,creditSamples};
}
