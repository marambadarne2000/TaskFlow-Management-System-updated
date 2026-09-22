import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Task } from "../../core/models/taskflow.models";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";
import { ApiClientService } from "../../core/services/api-client.service";

/** כלי פשוט לתכנון ספרינט לפי שעות, דחיפות וקיבולת העובדים */
@Component({selector:"app-planner",standalone:true,imports:[CommonModule,FormsModule],templateUrl:"./planner.component.html",styleUrl:"./planner.component.scss"})
export class PlannerComponent implements OnInit {
  weeks = 2;
  selectedIds = new Set<number>();
  constructor(public vm:TaskflowStoreService,private api:ApiClientService){}
  async ngOnInit(){const result=await this.api.request<{items:any[]}>("sprint-list");this.selectedIds=new Set(result.items.map(item=>+item.task_id));if(result.items[0])this.weeks=+result.items[0].weeks}

  get backlog(){return this.vm.tasks.filter(task=>task.status!=="done").sort((a,b)=>this.score(b)-this.score(a))}
  get selected(){return this.backlog.filter(task=>this.selectedIds.has(task.id))}
  get capacity(){return this.vm.employees.filter(employee=>employee.role==="employee"&&employee.status==="active").length*30*this.weeks}
  get plannedHours(){return this.selected.reduce((sum,task)=>sum+(task.estimatedHours||4),0)}
  get utilization(){return this.capacity?Math.min(100,Math.round(this.plannedHours/this.capacity*100)):0}
  get remaining(){return Math.max(0,this.capacity-this.plannedHours)}
  score(task:Task){const priority={critical:40,high:30,medium:20,low:10}[task.priority||"medium"];const days=this.vm.daysUntil(task.due);return priority+(days<0?50:Math.max(0,20-days))}
  selectedTask(task:Task){return this.selectedIds.has(task.id)}
  async toggle(task:Task){this.selectedTask(task)?this.selectedIds.delete(task.id):this.selectedIds.add(task.id);await this.save()}
  async clear(){this.selectedIds.clear();await this.save()}
  async autoPlan(){this.selectedIds.clear();let used=0;for(const task of this.backlog){const hours=task.estimatedHours||4;if(used+hours<=this.capacity){this.selectedIds.add(task.id);used+=hours}}await this.save()}
  async save(){await this.api.request("sprint-save","POST",{task_ids:[...this.selectedIds],weeks:this.weeks})}
}
