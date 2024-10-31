'use client'
import { Box, Button, Card, CardContent, Container, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Snackbar, TextField, Typography, styled } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { LoadingButton } from "@mui/lab";
import { useFormik } from "formik";
import { Dishes } from "src/types/Dishes";
import DishesService from "src/services/dishes";
import * as Yup from 'yup';
import { translation } from "src/utils/i18n.util";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import CategoryService from "src/services/category";



const ImageButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  height: 200,
  [theme.breakpoints.down('sm')]: {
    width: '100% !important',
    height: 100,
  },
  '&:hover, &.Mui-focusVisible': {
    zIndex: 1,
    '& .MuiImageBackdrop-root': {
      opacity: 0.15,
    },
    '& .MuiImageMarked-root': {
      opacity: 0,
    },
    '& .MuiTypography-root': {
      border: '4px solid currentColor',
    },
  },
})) as typeof Button;

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  position: 'absolute',
  overflow: 'hidden',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  whiteSpace: 'nowrap',
  zIndex: 10
});

const ImageSrc = styled('span')({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center 40%',
});

const Image = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.common.white,
}));

const ImageBackdrop = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: theme.palette.common.black,
  opacity: 0.4,
  transition: theme.transitions.create('opacity'),
}));

const ImageMarked = styled('span')(({ theme }) => ({
  height: 3,
  width: 18,
  backgroundColor: theme.palette.common.white,
  position: 'absolute',
  bottom: -2,
  left: 'calc(50% - 9px)',
  transition: theme.transitions.create('opacity'),
}));


interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const NumericFormatCustom = React.forwardRef<NumericFormatProps, CustomProps>(
  function NumericFormatCustom(props, ref) {
    const { onChange, ...other } = props;

    return (
      <NumericFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values: any) => {
          onChange({
            target: {
              name: props.name,
              value: values.value,
            },
          });
        }}
        thousandSeparator
        valueIsNumericString
        prefix="$"
      />
    );
  },
);
const DishesCreateComponent = () => {

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState([]);

  const formikDishes = useFormik({
    initialValues: {
      name: '',
      image: '',
      price: '',
      description: '',
      categoryId: '',
      status: 1
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required('Dishis name is required'),
      image: Yup.string().required('Image is required'),
      price: Yup.number().required('Price is required'),
      description: Yup.string().trim().required('Description is required'),
      status: Yup.string().required('Status is required')
    }),
    onSubmit: async (data: Dishes, { setFieldError }) => {
      setLoading(true);
      const formData = new FormData();
      formData.append('dishesForm', new Blob([JSON.stringify(data)], { type: "application/json" }));
      formData.append('Files', image);


      await DishesService.create(formData).
      then(() => {
        setOpen(true);
        setMessage(translation("dishes.create_title"));
        router.push("/dishes");
        setLoading(false);
      }).catch((error: any) => {
        if(error.response.status === 409){
          setFieldError("name", translation("error.duplicate_dishes_name"));
        }else{
          setFieldError("name", translation("error.dishes_name"));
        }
        setLoading(false);
      })
    }
  });


  const handleChangeImage = (e: any) => {
    setImage(e.target.files[0]);
    const reader = new FileReader()
    reader.readAsDataURL(e.target.files[0])
    reader.onload = () => {
      formikDishes.setFieldValue("image", reader.result)
    }
  }

  const getListCategory = async () => {
    const res = await CategoryService.getCategorySelected();
    if (res.status === 200) {
      setCategory(res.data);
    } else {
      console.log("errors");
    }
  }

  useEffect(() => {
    getListCategory();
  }, [])

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Grid>
            <Typography variant='h5'>{translation("dishes.create_title")}</Typography>
          </Grid>
        </Grid>

        <Container maxWidth="xl">
          <Grid item xs={12} sx={{ paddingBottom: 4 }}>
            <Grid container spacing={5} display={"unset"}>
              {
                <form onSubmit={formikDishes.handleSubmit}>
                  <Card>
                    <CardContent>
                      <Grid item xs={6} paddingTop={4}>
                        <TextField
                          fullWidth
                          name="name"
                          label={translation("common.name") + " *"}
                          placeholder={translation("common.name") + "..."}
                          size='small'
                          onChange={formikDishes.handleChange}
                          onBlur={formikDishes.handleBlur}
                          error={formikDishes.touched.name && formikDishes.errors.name ? true : false}
                          helperText={formikDishes.touched.name && formikDishes.errors.name}
                        />
                      </Grid>
                      <Grid item xs={6} paddingTop={4}>
                        <TextField
                          fullWidth
                          name="price"
                          label={translation("common.price") + " *"}
                          placeholder={translation("common.price") + "..."}
                          size='small'
                          InputProps={{
                            inputComponent: NumericFormatCustom as any,
                          }}
                          onChange={formikDishes.handleChange}
                          onBlur={formikDishes.handleBlur}
                          error={formikDishes.touched.price && formikDishes.errors.price ? true : false}
                          helperText={formikDishes.touched.price && formikDishes.errors.price}
                        />
                      </Grid>
                      <Grid item xs={6} paddingTop={4}>
                        <ImageButton
                          key={formikDishes.values.image}
                          tabIndex={-1}
                          component="label"
                          style={{
                            width: '30%',
                          }}
                        >
                          <VisuallyHiddenInput
                            type="file"
                            name="image"
                            accept="image/*"
                            onBlur={formikDishes.handleBlur}
                            onChange={handleChangeImage}
                          />
                          <ImageSrc style={{ backgroundImage: `url(${formikDishes.values.image})` }} />
                          {
                            !formikDishes.values.image &&
                            <>
                              <ImageBackdrop className="MuiImageBackdrop-root" />
                              <Image>
                                <Typography
                                  component="span"
                                  variant="subtitle1"
                                  color="inherit"
                                  sx={{
                                    position: 'relative',
                                    p: 4,
                                    pt: 2,
                                    pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
                                  }}
                                >
                                  {translation("common.upload")}
                                  <ImageMarked className="MuiImageMarked-root" />
                                </Typography>
                              </Image>
                            </>
                          }
                        </ImageButton>
                        <Typography sx={{ paddingLeft: '14px', fontSize: '12px', color: '#FF4C51' }}>
                          {formikDishes.touched.image && formikDishes.errors.image}
                        </Typography>
                      </Grid>

                      <Grid item xs={6} paddingTop={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="category-label">{translation("common.category") + " *"}</InputLabel>
                          <Select
                            labelId="category-label"
                            id="categoryId"
                            name="categoryId"
                            value={formikDishes.values.categoryId}
                            label={translation("common.category") + " *"}
                            onBlur={formikDishes.handleBlur}
                            onChange={formikDishes.handleChange}
                            error={formikDishes.touched.categoryId && formikDishes.errors.categoryId ? true : false}
                          >
                            {
                              category.map((row: any, index: any) => {
                                return <MenuItem key={index} value={row.id}>{row.name}</MenuItem>
                              })
                            }
                          </Select>
                        </FormControl>
                        <FormHelperText sx={{ color: '#FF4C51' }}>{formikDishes.touched.categoryId && formikDishes.errors.categoryId}</FormHelperText>
                      </Grid>

                      <Grid item xs={6} paddingTop={4}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="status-label">{translation("common.status")} *</InputLabel>
                          <Select
                            labelId="status-label"
                            id="status-id"
                            name="status"
                            value={formikDishes.values.status}
                            label={translation("common.status") + "..."}
                            onBlur={formikDishes.handleBlur}
                            onChange={formikDishes.handleChange}
                            error={formikDishes.touched.status && formikDishes.errors.status ? true : false}
                          >
                            <MenuItem value="1"> Active</MenuItem>
                            <MenuItem value="2"> Inactive</MenuItem>
                          </Select>
                          <Typography sx={{ paddingLeft: '14px', fontSize: '12px', color: '#FF4C51' }}>
                            {formikDishes.touched.status && formikDishes.errors.status}
                          </Typography>
                        </FormControl>
                      </Grid>



                      <Grid xs={6} paddingTop={4}>
                        <TextField
                          multiline
                          rows={4}
                          fullWidth
                          name="description"
                          label={translation("common.description")}
                          onChange={formikDishes.handleChange}
                          onBlur={formikDishes.handleBlur}
                          placeholder={translation("common.description") + "  ..."}
                          error={formikDishes.touched.description && formikDishes.errors.description ? true : false}
                          helperText={formikDishes.touched.description && formikDishes.errors.description && formikDishes.errors.description}
                        />
                      </Grid>
                      <Grid item paddingTop={4}>
                        <LoadingButton
                          type="submit"
                          variant='contained'
                          loading={loading}
                        >
                          {translation("common.save")}
                        </LoadingButton>

                        <Button sx={{ marginLeft: 4 }} variant='outlined' onClick={() => router.push("/dishes")}>
                          {translation("common.cancel")}
                        </Button>
                      </Grid>
                    </CardContent>
                  </Card>
                </form>
              }
            </Grid>
          </Grid>
          <Box sx={{ width: 500 }}>
            <Snackbar
              open={open}
              onClose={() => setOpen(false)}
              message={message}
              key={"bottom" + "left"}
            />
          </Box>
        </Container>
      </Grid>
    </>
  )
}

export default DishesCreateComponent;