import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../product.service';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Product } from '../product';
import { DepartmentService } from '../department.service';
import { Department } from '../department';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  productFrom: FormGroup = this.fb.group({
    _id: [null],
    name: ['', [Validators.required]],
    stock: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(0)]],
    departments: [[], [Validators.required]]
  });

  @ViewChild('form') form: NgForm;

  products: Product[] = [];
  departments: Department[] = [];

  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(
    private productService: ProductService,
    private fb:FormBuilder,
    private departmentService: DepartmentService,
    private snackbar: MatSnackBar ) { }

  ngOnInit() {
    this.productService      
      .get()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((prods)=> this.products = prods);
    this.departmentService.get()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((deps)  => this.departments= deps);
    
  }

  ngOnDestroy(){
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.unsubscribe$.next();
  }

  save() {
    let data = this.productFrom.value;
    if(data._id != null) {
      this.productService.update(data)
        .subscribe(
          (p) => this.notify('Atualizado com sucesso')
        );
    }else{
      this.productService.add(data)
        .subscribe(
          (p) => this.notify('cadastrado com sucesso')
        );
    }
    this.resteForm();

  }

  delete(p: Product) {
    this.productService.del(p)
    .subscribe(
      () => this.notify('Apagado'),
      (err) => console.log(err)
    )
  }

  edit(p: Product) {
    this.productFrom.setValue(p);
  }

  notify(msg: string) {
    this.snackbar.open(msg, "OK", {duration: 3000});
  }

  resteForm() {
    //this.productFrom.reset();
    this.form.resetForm();
  }

}
