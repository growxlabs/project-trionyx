'use client';
import { useEffect,useRef,useState } from 'react';
import { preparedActionSchema,type PreparedAction } from '@trionyx/validation';
export function PreparedActionCard({initial}:{initial:PreparedAction}) {
  const [action,setAction]=useState(initial),[busy,setBusy]=useState(false),[ready,setReady]=useState(false),[error,setError]=useState('');
  const submitting=useRef(false);
  useEffect(()=>{
    const abort=new AbortController();
    fetch(`/api/v1/internal/trix/actions?preparationId=${encodeURIComponent(initial.preparationId)}`,{cache:'no-store',signal:abort.signal})
      .then(async response=>{const json=await response.json();if(!response.ok)throw new Error(json.error?.message??'The preview could not be loaded.');setAction(preparedActionSchema.parse(json.data));setReady(true);})
      .catch(reason=>{if(!abort.signal.aborted)setError(reason instanceof Error?reason.message:'The preview could not be loaded.');});
    return()=>abort.abort();
  },[initial.preparationId]);
  async function submit(operation:'confirm'|'cancel') {
    if(submitting.current||!ready||action.state!=='PREPARED')return;
    submitting.current=true;setBusy(true);setError('');
    try {
      const response=await fetch('/api/v1/internal/trix/actions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operation,preparationId:action.preparationId,...(operation==='confirm'?{confirm:true,previewDigest:action.previewDigest}:{})})});
      const json=await response.json();
      if(!response.ok){
        // Refresh authoritative state after rejection/network-safe failure; never retry confirmation automatically.
        const latest=await fetch(`/api/v1/internal/trix/actions?preparationId=${encodeURIComponent(action.preparationId)}`,{cache:'no-store'});
        if(latest.ok)setAction(preparedActionSchema.parse((await latest.json()).data));
        throw new Error(json.error?.message??'This action could not be completed.');
      }
      setAction(preparedActionSchema.parse(json.data));
    }catch(reason){setError(reason instanceof Error?reason.message:'This action could not be completed. Reload the preview to check its state.');}
    finally{submitting.current=false;setBusy(false);}
  }
  return <section aria-label="Prepared action" className="border border-white/20 rounded p-4 space-y-3">
    <h2>{action.title}</h2><p>{action.state==='PREPARED'?'Prepared only. Business records have not changed.':`Action state: ${action.state}`}</p>
    <dl className="space-y-2">{action.currentState.map(record=><div key={record.id}><dt>{record.label} · {record.id}</dt><dd>Current status: {record.status}{action.actionType==='DEALER_DISTRIBUTOR_ASSIGNMENT'||action.actionType==='ENQUIRY_ASSIGNMENT'?` · Current assignment: ${record.assignmentLabel??'Unassigned'} (${record.assignmentId??'none'})`:''}{record.locationId?` · Source location: ${record.locationId}`:''}</dd></div>)}</dl>
    <p>Proposed: {action.proposedChange.destination?`${action.proposedChange.destination.label} (${action.proposedChange.destination.id})`:action.proposedChange.status}</p>
    {action.proposedChange.reason&&<p>Reason: {action.proposedChange.reason}</p>}
    <p>{action.consequences}</p><p>Expires: {new Date(action.expiresAt).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})} IST</p>
    {error&&<p role="alert">{error}</p>}
    {action.state==='PREPARED'&&<div className="flex gap-3"><button type="button" disabled={!ready||busy} onClick={()=>submit('confirm')}>Confirm exact change</button><button type="button" disabled={!ready||busy} onClick={()=>submit('cancel')}>Cancel action</button></div>}
  </section>;
}
