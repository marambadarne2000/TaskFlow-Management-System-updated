import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiClientService } from "../../core/services/api-client.service";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";

interface Rule { id:string; icon:string; title:string; description:string; trigger:string; action:string; enabled:boolean; runs:number; lastRunAt:string|null }
interface RunResult { created:number; executed:string[]; executed_count:number; ran_at:string }

@Component({selector:"app-automations",standalone:true,imports:[CommonModule,FormsModule],templateUrl:"./automations.component.html",styleUrl:"./automations.component.scss"})
export class AutomationsComponent implements OnInit {
  rules:Rule[]=[]; loading=true; runningAll=false; runningRuleId=""; changingRuleId=""; search=""; filter:"all"|"active"|"paused"="all"; message=""; messageType:"success"|"error"="success";
  constructor(public vm:TaskflowStoreService,private api:ApiClientService){}
  ngOnInit(){void this.load()}
  async load(){this.loading=true;try{const result=await this.api.request<{items:any[]}>("automation-list");this.rules=result.items.map(item=>({id:item.id,icon:item.icon,title:item.title,description:item.description,trigger:item.trigger_text,action:item.action_text,enabled:+item.enabled===1,runs:+item.runs,lastRunAt:item.last_run_at}))}catch(error:any){this.showMessage(error?.message||"טעינת האוטומציות נכשלה","error")}finally{this.loading=false}}
  get active(){return this.rules.filter(rule=>rule.enabled).length}
  get totalRuns(){return this.rules.reduce((sum,rule)=>sum+rule.runs,0)}
  get coverage(){return this.rules.length?Math.round(this.active/this.rules.length*100):0}
  get visibleRules(){const query=this.search.trim().toLowerCase();return this.rules.filter(rule=>(this.filter==="all"||(this.filter==="active"?rule.enabled:!rule.enabled))&&(!query||`${rule.title} ${rule.description} ${rule.trigger} ${rule.action}`.toLowerCase().includes(query)))}
  latestRun(){const dates=this.rules.map(rule=>rule.lastRunAt).filter(Boolean) as string[];return dates.sort().at(-1)||null}
  async toggle(rule:Rule){if(this.changingRuleId)return;this.changingRuleId=rule.id;const next=!rule.enabled;try{await this.api.request("automation-save","POST",{id:rule.id,enabled:next});rule.enabled=next;this.showMessage(`${rule.title} ${next?"הופעלה":"הושהתה"} בהצלחה`,"success")}catch(error:any){this.showMessage(error?.message||"עדכון החוק נכשל","error")}finally{this.changingRuleId=""}}
  async runNow(rule?:Rule){if(rule&&!rule.enabled){this.showMessage("יש להפעיל את החוק לפני ההרצה","error");return}rule?this.runningRuleId=rule.id:this.runningAll=true;try{const result=await this.api.request<RunResult>("automation-run","POST",rule?{id:rule.id}:{});this.showMessage(`ההרצה הסתיימה: ${result.executed_count} חוקים נבדקו ונוצרו ${result.created} התראות חדשות`,"success");await this.load();await this.vm.refreshWorkspace()}catch(error:any){this.showMessage(error?.message||"הרצת האוטומציה נכשלה","error")}finally{this.runningAll=false;this.runningRuleId=""}}
  private showMessage(text:string,type:"success"|"error"){this.message=text;this.messageType=type}
}
